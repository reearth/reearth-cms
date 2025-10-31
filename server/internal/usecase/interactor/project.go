package interactor

import (
	"context"
	"slices"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Project struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewProject(r *repo.Container, g *gateway.Container) interfaces.Project {
	return &Project{
		repos:    r,
		gateways: g,
	}
}

func (i *Project) Fetch(ctx context.Context, ids []id.ProjectID, _ *usecase.Operator) (project.List, error) {
	return i.repos.Project.FindByIDs(ctx, ids)
}

func (i *Project) FindByWorkspace(ctx context.Context, wid accountdomain.WorkspaceID, f *interfaces.ProjectFilter, _ *usecase.Operator) (project.List, *usecasex.PageInfo, error) {
	if f == nil {
		f = &interfaces.ProjectFilter{}
	}
	if f.WorkspaceIds == nil {
		f.WorkspaceIds = &accountdomain.WorkspaceIDList{}
	}
	f.WorkspaceIds = lo.ToPtr(append(*f.WorkspaceIds, wid))
	return i.repos.Project.Search(ctx, *f)
}

func (i *Project) FindByWorkspaces(ctx context.Context, wIds accountdomain.WorkspaceIDList, f *interfaces.ProjectFilter, _ *usecase.Operator) (project.List, *usecasex.PageInfo, error) {
	if f == nil {
		f = &interfaces.ProjectFilter{}
	}
	if f.WorkspaceIds == nil {
		f.WorkspaceIds = &accountdomain.WorkspaceIDList{}
	}
	f.WorkspaceIds = lo.ToPtr(append(*f.WorkspaceIds, wIds...))
	return i.repos.Project.Search(ctx, *f)
}

func (i *Project) Search(ctx context.Context, f interfaces.ProjectFilter, _ *usecase.Operator) (project.List, *usecasex.PageInfo, error) {
	if f.WorkspaceIds == nil || len(*f.WorkspaceIds) == 0 {
		f.Visibility = lo.ToPtr(project.VisibilityPublic)
	}
	return i.repos.Project.Search(ctx, f)
}

func (i *Project) FindByIDOrAlias(ctx context.Context, wsIdOrAlias accountdomain.WorkspaceIDOrAlias, idOrAlias project.IDOrAlias, _ *usecase.Operator) (*project.Project, error) {
	w, err := i.repos.Workspace.FindByIDOrAlias(ctx, wsIdOrAlias)
	if err != nil {
		return nil, err
	}
	if w == nil {
		return nil, rerror.ErrNotFound
	}

	return i.repos.Project.FindByIDOrAlias(ctx, w.ID(), idOrAlias)
}

func (i *Project) Create(ctx context.Context, param interfaces.CreateProjectParam, op *usecase.Operator) (_ *project.Project, err error) {
	if !op.IsUserOrIntegration() {
		return nil, interfaces.ErrInvalidOperator
	}

	visibility := project.VisibilityPublic
	if param.Accessibility != nil && param.Accessibility.Visibility != nil {
		visibility = *param.Accessibility.Visibility
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		// Check general operation allowed first
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: param.WorkspaceID,
			CheckType:   gateway.PolicyCheckGeneralOperationAllowed,
			Value:       1,
		}

		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, err
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrOperationDenied
		}

		// Check specific project creation limits
		var checkType gateway.PolicyCheckType
		if visibility == project.VisibilityPublic {
			checkType = gateway.PolicyCheckGeneralPublicProjectCreation
		} else {
			checkType = gateway.PolicyCheckGeneralPrivateProjectCreation
		}

		policyReq.CheckType = checkType
		policyResp, err = i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, err
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrProjectCreationLimitExceeded
		}
	}

	return Run1(ctx, op, i.repos, Usecase().WithWritableWorkspaces(param.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			pb := project.New().
				NewID().
				Workspace(param.WorkspaceID)
			if param.Name != nil {
				pb = pb.Name(*param.Name)
			}
			if param.Description != nil {
				pb = pb.Description(*param.Description)
			}
			if param.License != nil {
				pb = pb.License(*param.License)
			}
			if param.Readme != nil {
				pb = pb.Readme(*param.Readme)
			}
			if param.Alias != nil {
				if ok, _ := i.repos.Project.IsAliasAvailable(ctx, param.WorkspaceID, *param.Alias); !ok {
					return nil, interfaces.ErrProjectAliasAlreadyUsed
				}
				pb = pb.Alias(*param.Alias)
			}
			if len(param.RequestRoles) > 0 {
				pb = pb.RequestRoles(param.RequestRoles)
			} else {
				pb = pb.RequestRoles([]workspace.Role{})
			}

			if param.Accessibility != nil && param.Accessibility.Visibility != nil {
				accessibility := project.NewAccessibility(*param.Accessibility.Visibility, nil, nil)
				pb = pb.Accessibility(accessibility)
			}

			if param.Topics != nil {
				pb = pb.Topics(*param.Topics)
			}

			proj, err := pb.Build()
			if err != nil {
				return nil, err
			}

			err = i.repos.Project.Save(ctx, proj)
			if err != nil {
				return nil, err
			}
			return proj, nil
		})
}

func (i *Project) Update(ctx context.Context, param interfaces.UpdateProjectParam, op *usecase.Operator) (_ *project.Project, err error) {
	if !op.IsUserOrIntegration() {
		return nil, interfaces.ErrInvalidOperator
	}

	p, err := i.repos.Project.FindByID(ctx, param.ID)
	if err != nil {
		return nil, err
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		// Check general operation allowed first
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: p.Workspace(),
			CheckType:   gateway.PolicyCheckGeneralOperationAllowed,
			Value:       1,
		}

		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return nil, err
		}
		if !policyResp.Allowed {
			return nil, interfaces.ErrOperationDenied
		}
	}

	if param.Accessibility != nil && param.Accessibility.Visibility != nil {
		newVisibility := *param.Accessibility.Visibility
		OldVisibility := project.VisibilityPublic
		if p.Accessibility() != nil {
			OldVisibility = p.Accessibility().Visibility()
		}

		if OldVisibility != newVisibility {
			checkType := gateway.PolicyCheckGeneralPublicProjectCreation
			if newVisibility == project.VisibilityPrivate {
				checkType = gateway.PolicyCheckGeneralPrivateProjectCreation
			}

			err := i.ensurePolicy(ctx, p.Workspace(), checkType, 1)
			if err != nil {
				return nil, err
			}
		}
	}

	return Run1(ctx, op, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			if param.Name != nil {
				p.UpdateName(*param.Name)
			}

			if param.Description != nil {
				p.UpdateDescription(*param.Description)
			}

			if param.License != nil {
				p.UpdateLicense(*param.License)
			}

			if param.Readme != nil {
				p.UpdateReadMe(*param.Readme)
			}

			if param.Alias != nil && *param.Alias != p.Alias() {
				if ok, _ := i.repos.Project.IsAliasAvailable(ctx, p.Workspace(), *param.Alias); !ok {
					return nil, interfaces.ErrProjectAliasAlreadyUsed
				}

				if err := p.UpdateAlias(*param.Alias); err != nil {
					return nil, err
				}
			}

			if param.Accessibility != nil {
				if !op.IsMaintainingWorkspace(p.Workspace()) {
					return nil, interfaces.ErrOperationDenied
				}
				accessibility := p.Accessibility()
				if accessibility == nil {
					accessibility = project.NewPublicAccessibility()
				}

				if param.Accessibility.Visibility != nil {
					accessibility.SetVisibility(*param.Accessibility.Visibility)
				}
				if param.Accessibility.Publication != nil && accessibility.Visibility() == project.VisibilityPrivate {
					accessibility.SetPublication(project.NewPublicationSettings(param.Accessibility.Publication.PublicModels, param.Accessibility.Publication.PublicAssets))
				}
				p.SetAccessibility(*accessibility)
			}

			if param.RequestRoles != nil {
				p.SetRequestRoles(param.RequestRoles)
			}

			if param.Topics != nil {
				p.SetTopics(*param.Topics)
			}

			p.SetUpdatedAt(util.Now())
			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}

func (i *Project) ensurePolicy(ctx context.Context, wID workspace.ID, checkType gateway.PolicyCheckType, value int64) error {
	if i.gateways == nil || i.gateways.PolicyChecker == nil {
		return nil
	}

	policyReq := gateway.PolicyCheckRequest{
		WorkspaceID: wID,
		CheckType:   checkType,
		Value:       value,
	}

	policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
	if err != nil {
		return err
	}
	if !policyResp.Allowed {
		return interfaces.ErrProjectCreationLimitExceeded
	}

	return nil
}

func (i *Project) CheckAlias(ctx context.Context, wId accountdomain.WorkspaceID, alias string) (bool, error) {
	return Run1(ctx, nil, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (bool, error) {
			if !project.CheckAliasPattern(alias) {
				return false, project.ErrInvalidAlias
			}

			return i.repos.Project.IsAliasAvailable(ctx, wId, alias)
		})
}

func (i *Project) Delete(ctx context.Context, projectID id.ProjectID, op *usecase.Operator) (err error) {
	if !op.IsUserOrIntegration() {
		return interfaces.ErrInvalidOperator
	}
	proj, err := i.repos.Project.FindByID(ctx, projectID)
	if err != nil {
		return err
	}

	if i.gateways != nil && i.gateways.PolicyChecker != nil {
		// Check general operation allowed first
		policyReq := gateway.PolicyCheckRequest{
			WorkspaceID: proj.Workspace(),
			CheckType:   gateway.PolicyCheckGeneralOperationAllowed,
			Value:       1,
		}

		policyResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, policyReq)
		if err != nil {
			return err
		}
		if !policyResp.Allowed {
			return interfaces.ErrOperationDenied
		}
	}

	return Run0(ctx, op, i.repos, Usecase().WithWritableWorkspaces(proj.Workspace()).Transaction(),
		func(ctx context.Context) error {
			if !op.IsWritableWorkspace(proj.Workspace()) {
				return interfaces.ErrOperationDenied
			}
			if err := i.repos.Project.Remove(ctx, projectID); err != nil {
				return err
			}
			return nil
		})
}

func (i *Project) CreateAPIKey(ctx context.Context, param interfaces.CreateAPITokenParam, op *usecase.Operator) (*project.Project, *project.APIKeyID, error) {
	p, err := i.repos.Project.FindByID(ctx, param.ProjectID)
	if err != nil {
		return nil, nil, err
	}
	return Run2(ctx, op, i.repos, Usecase().WithMaintainableWorkspaces(p.Workspace()).Transaction(),
		func(ctx context.Context) (*project.Project, *project.APIKeyID, error) {
			if !op.IsMaintainingProject(p.ID()) {
				return nil, nil, interfaces.ErrOperationDenied
			}

			a := p.Accessibility()
			if a == nil || a.Visibility() != project.VisibilityPrivate {
				return nil, nil, interfaces.ErrInvalidProject
			}

			key := project.NewAPIKeyBuilder().
				NewID().
				Name(param.Name).
				Description(param.Description).
				Publication(project.NewPublicationSettings(param.Publication.PublicModels, param.Publication.PublicAssets)).
				GenerateKey().
				Build()

			a.AddAPIKey(*key)
			p.SetAccessibility(*a)

			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, nil, err
			}

			return p, key.ID().Ref(), nil
		})
}

func (i *Project) UpdateAPIKey(ctx context.Context, param interfaces.UpdateAPITokenParam, op *usecase.Operator) (*project.Project, error) {
	p, err := i.repos.Project.FindByID(ctx, param.ProjectID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, op, i.repos, Usecase().WithMaintainableWorkspaces(p.Workspace()).Transaction(),
		func(ctx context.Context) (*project.Project, error) {
			if !op.IsMaintainingProject(p.ID()) {
				return nil, interfaces.ErrOperationDenied
			}

			a := p.Accessibility()
			if a == nil || a.Visibility() != project.VisibilityPrivate {
				return nil, interfaces.ErrInvalidProject
			}

			key := a.APIKeyById(param.TokenId)
			if key == nil {
				return nil, rerror.ErrNotFound
			}

			if param.Name != nil {
				key.SetName(*param.Name)
			}
			if param.Description != nil {
				key.SetDescription(*param.Description)
			}
			if param.Publication != nil {
				key.SetPublication(*project.NewPublicationSettings(param.Publication.PublicModels, param.Publication.PublicAssets))
			}

			a.UpdateAPIKey(*key)
			p.SetAccessibility(*a)

			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}

func (i *Project) DeleteAPIKey(ctx context.Context, pId id.ProjectID, kId id.APIKeyID, op *usecase.Operator) (*project.Project, error) {
	p, err := i.repos.Project.FindByID(ctx, pId)
	if err != nil {
		return nil, err
	}
	return Run1(context.Background(), nil, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (*project.Project, error) {
			if !op.IsMaintainingProject(p.ID()) {
				return nil, interfaces.ErrOperationDenied
			}

			a := p.Accessibility()
			if a == nil || a.Visibility() != project.VisibilityPrivate {
				return nil, interfaces.ErrInvalidProject
			}

			if a.APIKeyById(kId) == nil {
				return nil, rerror.ErrNotFound
			}

			a.RemoveAPIKey(kId)
			p.SetAccessibility(*a)

			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}

func (i *Project) RegenerateAPIKeyKey(ctx context.Context, param interfaces.RegenerateKeyParam, op *usecase.Operator) (*project.Project, error) {
	if op.AcOperator.User == nil {
		return nil, interfaces.ErrInvalidOperator
	}
	return Run1(ctx, op, i.repos, Usecase().Transaction(),
		func(ctx context.Context) (*project.Project, error) {
			p, err := i.repos.Project.FindByID(ctx, param.ProjectId)
			if err != nil {
				return nil, err
			}

			// check if the user is the owner of the project
			if !op.IsOwningProject(p.ID()) {
				return nil, interfaces.ErrOperationDenied
			}

			if p.Accessibility().Visibility() != project.VisibilityPrivate {
				return nil, interfaces.ErrInvalidProject
			}

			key := p.Accessibility().APIKeyById(param.KeyId)
			key.GenerateKey()
			p.Accessibility().UpdateAPIKey(*key)
			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}

func (i *Project) CheckProjectLimits(ctx context.Context, workspaceID accountdomain.WorkspaceID, op *usecase.Operator) (*interfaces.ProjectLimitsResult, error) {
	if !op.IsUserOrIntegration() {
		return nil, interfaces.ErrInvalidOperator
	}

	// Check if user has access to the workspace
	if !op.IsReadableWorkspace(workspaceID) {
		return nil, interfaces.ErrOperationDenied
	}

	result := &interfaces.ProjectLimitsResult{
		PublicProjectsAllowed:  true,
		PrivateProjectsAllowed: true,
	}

	// If no policy checker is configured, allow everything
	if i.gateways == nil || i.gateways.PolicyChecker == nil {
		return result, nil
	}

	// Define a result structure for channel communication
	type policyResult struct {
		isPublic bool
		allowed  bool
		err      error
	}

	// Create channels to collect results
	resultCh := make(chan policyResult, 2)

	// Check public project creation limit in goroutine
	go func() {
		publicResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, gateway.PolicyCheckRequest{
			WorkspaceID: workspaceID,
			CheckType:   gateway.PolicyCheckGeneralPublicProjectCreation,
			Value:       1,
		})
		if err != nil {
			resultCh <- policyResult{isPublic: true, err: err}
			return
		}
		resultCh <- policyResult{isPublic: true, allowed: publicResp.Allowed}
	}()

	// Check private project creation limit in goroutine
	go func() {
		privateResp, err := i.gateways.PolicyChecker.CheckPolicy(ctx, gateway.PolicyCheckRequest{
			WorkspaceID: workspaceID,
			CheckType:   gateway.PolicyCheckGeneralPrivateProjectCreation,
			Value:       1,
		})
		if err != nil {
			resultCh <- policyResult{isPublic: false, err: err}
			return
		}
		resultCh <- policyResult{isPublic: false, allowed: privateResp.Allowed}
	}()

	// Collect results from both goroutines
	for i := 0; i < 2; i++ {
		res := <-resultCh
		if res.err != nil {
			return nil, res.err
		}

		if res.isPublic {
			result.PublicProjectsAllowed = res.allowed
		} else {
			result.PrivateProjectsAllowed = res.allowed
		}
	}

	return result, nil
}

func (i *Project) StarProject(ctx context.Context, wsIdOrAlias accountdomain.WorkspaceIDOrAlias, idOrAlias project.IDOrAlias, op *usecase.Operator) (_ *project.Project, err error) {
	userID := op.AcOperator.User
	if userID == nil {
		return nil, interfaces.ErrInvalidOperator
	}

	w, err := i.repos.Workspace.FindByIDOrAlias(ctx, wsIdOrAlias)
	if err != nil {
		return nil, err
	}
	if w == nil {
		return nil, rerror.ErrNotFound
	}

	p, err := i.repos.Project.FindByIDOrAlias(ctx, w.ID(), idOrAlias)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, rerror.ErrNotFound
	}

	return Run1(ctx, op, i.repos, Usecase().WithWritableWorkspaces(p.Workspace()).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			if slices.Contains(p.StarredBy(), userID.String()) {
				p.Unstar(*userID)
			} else {
				p.Star(*userID)
			}

			p.SetUpdatedAt(util.Now())
			if err := i.repos.Project.Save(ctx, p); err != nil {
				return nil, err
			}

			return p, nil
		})
}
