package main

import (
	"context"
	"encoding/json"
	"flag"
	"io"
	"os"

	"github.com/reearth/reearth-cms/server/internal/adapter/integration"
	"github.com/reearth/reearth-cms/server/internal/app"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	integration2 "github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountrepo"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
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
		format := importCmd.String("format", "", "")
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

		if format == nil || (*format != "json" && *format != "geojson") {
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

		m, err := uc.Model.FindByID(ctx, *mId, op)
		if err != nil {
			log.Fatalf("model not found: %v", err)
		}

		sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
		if err != nil {
			log.Fatalf("schema not found: %v", err)
		}

		frc, _, err := uc.Asset.DownloadByID(ctx, *aId, nil, op)
		if err != nil {
			log.Fatalf("asset not found: %v", err)
		}

		items, fields, err := itemsFromJson(frc, *format == "geojson", geometryFieldKey, *sp)
		if err != nil {
			log.Fatalf("failed to parse json: %v", err)
		}

		cp := interfaces.ImportItemsParam{
			SP:           *sp,
			ModelID:      m.ID(),
			Strategy:     strategy,
			MutateSchema: lo.FromPtrOr(mutateSchema, false),
			Items:        items,
			Fields:       fields,
		}

		_, err = uc.Item.Import(ctx, cp, op)
		if err != nil {
			log.Fatalf("failed to import: %v", err)
		}
	}
}

func itemsFromJson(r io.Reader, isGeoJson bool, geoField *string, sp schema.Package) ([]interfaces.ImportItemParam, []interfaces.CreateFieldParam, error) {
	var jsonObjects []map[string]any
	if isGeoJson {
		var geoJson integrationapi.GeoJSON
		err := json.NewDecoder(r).Decode(&geoJson)
		if err != nil {
			return nil, nil, err
		}
		if geoJson.Features == nil {
			return nil, nil, rerror.ErrInvalidParams
		}
		for _, feature := range *geoJson.Features {
			var f map[string]any
			_ = json.Unmarshal(lo.Must(json.Marshal(feature)), &f)
			jsonObjects = append(jsonObjects, f)
		}
	} else {
		err := json.NewDecoder(r).Decode(&jsonObjects)
		if err != nil {
			return nil, nil, err
		}
	}

	items := make([]interfaces.ImportItemParam, 0)
	fields := make([]interfaces.CreateFieldParam, 0)
	for _, o := range jsonObjects {
		var iId *id.ItemID
		//idStr, _ := o["id"].(string)
		//iId = id.ItemIDFromRef(&idStr)
		if idVal, ok := o["id"]; ok {
			if idStr, ok := idVal.(string); ok {
				iId = id.ItemIDFromRef(&idStr)
				if iId.IsEmpty() || iId.IsNil() {
					return nil, nil, rerror.ErrInvalidParams
				}
			} else {
				return nil, nil, rerror.ErrInvalidParams
			}
		}
		item := interfaces.ImportItemParam{
			ItemId:     iId,
			MetadataID: nil,
			Fields:     nil,
		}
		if isGeoJson {
			if geoField == nil {
				return nil, nil, rerror.ErrInvalidParams
			}

			geoFieldKey := id.NewKey(*geoField)
			if !geoFieldKey.IsValid() {
				return nil, nil, rerror.ErrInvalidParams
			}
			geoFieldId := id.FieldIDFromRef(geoField)
			f := sp.FieldByIDOrKey(geoFieldId, &geoFieldKey)
			if f == nil { // TODO: check GeoField type
				return nil, nil, rerror.ErrInvalidParams
			}

			v, err := json.Marshal(o["geometry"])
			if err != nil {
				return nil, nil, err
			}
			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: f.ID().Ref(),
				Key:   f.Key().Ref(),
				Value: string(v),
				// Group is not supported
				Group: nil,
			})

			props, ok := o["properties"].(map[string]any)
			if !ok {
				continue
			}
			o = props
		}
		for k, v := range o {
			if v == nil || k == "id" {
				continue
			}
			key := id.NewKey(k)
			if !key.IsValid() {
				return nil, nil, rerror.ErrInvalidParams
			}
			newField := integration.FieldFrom(key.String(), v, sp)
			f := sp.FieldByIDOrKey(nil, &key)
			if f != nil && !isAssignable(newField.Type, f.Type()) {
				continue
			}

			if f == nil {
				prevField, found := lo.Find(fields, func(fp interfaces.CreateFieldParam) bool {
					return fp.Key == key.String()
				})
				if found && prevField.Type != newField.Type {
					return nil, nil, rerror.NewE(i18n.T("data type mismatch"))
				}
				if !found {
					fields = append(fields, newField)
				}
			}

			item.Fields = append(item.Fields, interfaces.ItemFieldParam{
				Field: nil,
				Key:   key.Ref(),
				Value: v,
				// Group is not supported
				Group: nil,
			})
		}
		items = append(items, item)
	}
	return items, fields, nil
}

// isAssignable returns true if vt1 is assignable to vt2
func isAssignable(vt1, vt2 value.Type) bool {
	if vt1 == vt2 {
		return true
	}
	if vt1 == value.TypeInteger &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown || vt2 == value.TypeNumber) {
		return true
	}
	if vt1 == value.TypeNumber &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeBool &&
		(vt2 == value.TypeCheckbox || vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	if vt1 == value.TypeText &&
		(vt2 == value.TypeText || vt2 == value.TypeRichText || vt2 == value.TypeMarkdown) {
		return true
	}
	return false
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
