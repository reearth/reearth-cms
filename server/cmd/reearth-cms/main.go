package main

import (
	"context"
	"flag"
	"os"

	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	integration2 "github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"golang.org/x/text/language"
)

var version = ""

func main() {
	log.Infof("reearth-cms %s", version)
	if len(os.Args) == 1 {
		app.Start(debug, version)
	}
	if len(os.Args) >= 3 && os.Args[1] == "item" && os.Args[2] == "import" {
		importCmd := flag.NewFlagSet("import", flag.ExitOnError)
		uIdStr := importCmd.String("userId", "", "")
		iIdStr := importCmd.String("integrationId", "", "")
		mIdStr := importCmd.String("modelId", "", "")
		aIdStr := importCmd.String("assetId", "", "")
		formatStr := importCmd.String("format", "", "")
		geometryFieldKey := importCmd.String("geometryFieldKey", "", "")
		strategyStr := importCmd.String("strategy", "", "")
		mutateSchema := importCmd.Bool("mutateSchema", false, "")

		err := importCmd.Parse(os.Args[3:])
		if err != nil {
			return
		}

		mId := id.ModelIDFromRef(mIdStr)
		if mId == nil {
			log.Fatal("invalid model id")
		}
		aId := id.AssetIDFromRef(aIdStr)
		if aId == nil {
			log.Fatal("invalid asset id")
		}

		if strategyStr == nil {
			log.Fatalf("strategy is required")
		}
		strategy := interfaces.ImportStrategyTypeFromString(*strategyStr)
		if strategy == "" {
			log.Fatalf("invalid strategy")
		}

		if formatStr == nil {
			log.Fatalf("format is required")
		}
		format := interfaces.ImportFormatTypeFromString(*formatStr)
		if format == "" {
			log.Fatalf("invalid format")
		}

		ctx := context.Background()

		// Load config
		conf, err := app.ReadConfig(debug)
		if err != nil {
			log.Fatal(err)
		}
		log.Infof("config: %s", conf.Print())

		// Init repositories
		repos, gateways, acRepos, acGateways := app.InitReposAndGateways(ctx, conf)

		uc := interactor.New(repos, gateways, acRepos, acGateways, interactor.ContainerConfig{
			SignupSecret:    conf.SignupSecret,
			AuthSrvUIDomain: conf.Host_Web,
		})

		// get op from user id
		var op *usecase.Operator
		if uIdStr != nil && *uIdStr != "" {
			op, err = generateUserOperator(ctx, *uIdStr, repos, acRepos)
		} else if iIdStr != nil && *iIdStr != "" {
			op, err = generateIntegrationOperator(ctx, *iIdStr, repos, acRepos)
		}
		if err != nil || op == nil {
			log.Fatalf("failed to generate operator: %v", err)
		}

		sp, err := uc.Schema.FindByModel(ctx, *mId, op)
		if err != nil {
			log.Fatalf("schema not found: %v", err)
		}

		frc, _, err := uc.Asset.DownloadByID(ctx, *aId, nil, op)
		if err != nil {
			log.Fatalf("asset not found: %v", err)
		}

		log.Infof("importing items from asset %s", aId.String())

		cp := interfaces.ImportItemsParam{
			SP:           *sp,
			ModelID:      *mId,
			Format:       format,
			Strategy:     strategy,
			MutateSchema: lo.FromPtrOr(mutateSchema, false),
			GeoField:     geometryFieldKey,
			Reader:       frc,
		}

		_, err = uc.Item.Import(ctx, cp, op)
		if err != nil {
			log.Fatalf("failed to import: %v", err)
		}
	}
}

func generateUserOperator(ctx context.Context, uIdStr string, repo *repo.Container, accRepo *accountrepo.Container) (*usecase.Operator, error) {
	uId, err := user.IDFrom(uIdStr)
	if err != nil {
		return nil, err
	}
	w, err := accRepo.Workspace.FindByUser(ctx, uId)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByUserRole(uId, workspace.RoleReader).IDs()
	ww := w.FilterByUserRole(uId, workspace.RoleWriter).IDs()
	mw := w.FilterByUserRole(uId, workspace.RoleMaintainer).IDs()
	ow := w.FilterByUserRole(uId, workspace.RoleOwner).IDs()

	rp, wp, mp, op, err := operatorProjects(ctx, repo, w, rw, ww, mw, ow)
	if err != nil {
		return nil, err
	}

	acop := &accountusecase.Operator{
		User: &uId,

		ReadableWorkspaces:     rw,
		WritableWorkspaces:     ww,
		MaintainableWorkspaces: mw,
		OwningWorkspaces:       ow,
	}

	return &usecase.Operator{
		Integration:          nil,
		Lang:                 language.English.String(),
		ReadableProjects:     rp,
		WritableProjects:     wp,
		MaintainableProjects: mp,
		OwningProjects:       op,

		AcOperator: acop,
	}, nil
}

func generateIntegrationOperator(ctx context.Context, iIdStr string, repo *repo.Container, accRepo *accountrepo.Container) (*usecase.Operator, error) {
	iId, err := accountdomain.IntegrationIDFrom(iIdStr)
	if err != nil {
		return nil, err
	}
	w, err := accRepo.Workspace.FindByIntegration(ctx, iId)
	if err != nil {
		return nil, err
	}

	rw := w.FilterByIntegrationRole(iId, workspace.RoleReader).IDs()
	ww := w.FilterByIntegrationRole(iId, workspace.RoleWriter).IDs()
	mw := w.FilterByIntegrationRole(iId, workspace.RoleMaintainer).IDs()
	ow := w.FilterByIntegrationRole(iId, workspace.RoleOwner).IDs()

	rp, wp, mp, op, err := operatorProjects(ctx, repo, w, rw, ww, mw, ow)
	if err != nil {
		return nil, err
	}

	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:                   nil,
			ReadableWorkspaces:     rw,
			WritableWorkspaces:     ww,
			MaintainableWorkspaces: mw,
			OwningWorkspaces:       ow,
		},
		Integration:          integration2.IDFromRef(iId.StringRef()),
		Lang:                 language.English.String(),
		ReadableProjects:     rp,
		WritableProjects:     wp,
		MaintainableProjects: mp,
		OwningProjects:       op,
	}, nil
}

func operatorProjects(ctx context.Context, g *repo.Container, w workspace.List, rw, ww, mw, ow user.WorkspaceIDList) (id.ProjectIDList, id.ProjectIDList, id.ProjectIDList, id.ProjectIDList, error) {
	rp := id.ProjectIDList{}
	wp := id.ProjectIDList{}
	mp := id.ProjectIDList{}
	op := id.ProjectIDList{}

	if len(w) == 0 {
		return rp, wp, op, mp, nil
	}
	var cur *usecasex.Cursor
	for {
		projects, pi, err := g.Project.FindByWorkspaces(ctx, w.IDs(), usecasex.CursorPagination{
			After: cur,
			First: lo.ToPtr(int64(100)),
		}.Wrap())
		if err != nil {
			return nil, nil, nil, nil, err
		}

		for _, p := range projects {
			if ow.Has(p.Workspace()) {
				op = append(op, p.ID())
			} else if mw.Has(p.Workspace()) {
				mp = append(mp, p.ID())
			} else if ww.Has(p.Workspace()) {
				wp = append(wp, p.ID())
			} else if rw.Has(p.Workspace()) {
				rp = append(rp, p.ID())
			}
		}

		if !pi.HasNextPage {
			break
		}
		cur = pi.EndCursor
	}
	return rp, wp, mp, op, nil
}
