package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	ErrMultipleReference   = errors.New("multiple reference is not supported")
	ErrNotImplemented      = errors.New("not implemented")
	ErrInvalidTypeProperty = errors.New("invalid type property")
)

func (s *Server) SchemaFilter(ctx context.Context, request SchemaFilterRequestObject) (SchemaFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return SchemaFilter404Response{}, err
		}
		return nil, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	params := interfaces.FindByProjectAndKeywordParam{
		ProjectID:  prj.ID(),
		Keyword:    lo.FromPtrOr(request.Params.Keyword, ""),
		Sort:       toModelSort(request.Params.Sort, request.Params.Dir),
		Pagination: p,
	}

	ms, pi, err := uc.Model.FindByProjectAndKeyword(ctx, params, op)
	if err != nil {
		return nil, err
	}

	models := make([]integrationapi.Model, 0, len(ms))
	for _, m := range ms {
		sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
		if err != nil {
			return nil, err
		}
		lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		models = append(models, integrationapi.NewModel(m, sp, lastModified))
	}

	return SchemaFilter200JSONResponse{
		Models:     &models,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) FieldCreate(ctx context.Context, request FieldCreateRequestObject) (FieldCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldCreate400Response{}, err
		}
		return FieldCreate400Response{}, err
	}

	m, err := uc.Model.FindBySchema(ctx, sch.ID(), op)
	if err != nil {
		return FieldCreate400Response{}, err
	}

	tp, dv, err := FromSchemaTypeProperty(*request.Body.Type, *request.Body.Multiple)
	if err != nil {
		return nil, err
	}

	param := interfaces.CreateFieldParam{
		ModelID:      m.ID().Ref(),
		SchemaID:     sch.ID(),
		Type:         integrationapi.FromValueType(request.Body.Type),
		Name:         *request.Body.Key,
		Description:  nil,
		Key:          *request.Body.Key,
		Multiple:     *request.Body.Multiple,
		Unique:       false,
		Required:     *request.Body.Required,
		IsTitle:      false,
		TypeProperty: tp,
		DefaultValue: dv,
	}
	f, err := uc.Schema.CreateField(ctx, param, op)
	if err != nil {
		return FieldCreate400Response{}, err
	}

	return FieldCreate200JSONResponse{
		Id:       f.ID().Ref(),
		Key:      f.Key().Ref().StringRef(),
		Multiple: lo.ToPtr(f.Multiple()),
		Required: lo.ToPtr(f.Required()),
		Type:     lo.ToPtr(integrationapi.ToValueType(f.Type())),
	}, err
}

func (s *Server) FieldCreateWithProject(ctx context.Context, request FieldCreateWithProjectRequestObject) (FieldCreateWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldCreateWithProject400Response{}, err
		}
		return FieldCreateWithProject400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldCreateWithProject400Response{}, err
		}
		return FieldCreateWithProject400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldCreateWithProject400Response{}, err
		}
		return FieldCreateWithProject400Response{}, err
	}

	tp, dv, err := FromSchemaTypeProperty(*request.Body.Type, *request.Body.Multiple)
	if err != nil {
		return nil, err
	}

	param := interfaces.CreateFieldParam{
		ModelID:      m.ID().Ref(),
		SchemaID:     sch.Schema().ID(),
		Type:         integrationapi.FromValueType(request.Body.Type),
		Name:         *request.Body.Key,
		Description:  nil,
		Key:          *request.Body.Key,
		Multiple:     *request.Body.Multiple,
		Unique:       false,
		Required:     *request.Body.Required,
		IsTitle:      false,
		TypeProperty: tp,
		DefaultValue: dv,
	}
	f, err := uc.Schema.CreateField(ctx, param, op)
	if err != nil {
		return FieldCreateWithProject400Response{}, err
	}

	return FieldCreateWithProject200JSONResponse{
		Id:       f.ID().Ref(),
		Key:      f.Key().Ref().StringRef(),
		Multiple: lo.ToPtr(f.Multiple()),
		Required: lo.ToPtr(f.Required()),
		Type:     lo.ToPtr(integrationapi.ToValueType(f.Type())),
	}, err
}

func (s *Server) FieldUpdate(ctx context.Context, request FieldUpdateRequestObject) (FieldUpdateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldUpdate400Response{}, err
		}
		return FieldUpdate400Response{}, err
	}

	m, err := uc.Model.FindBySchema(ctx, sch.ID(), op)
	if err != nil {
		return FieldUpdate400Response{}, err
	}

	idOrKey := (*string)(&request.FieldIdOrKey)
	f := sch.FieldByIDOrKey(id.FieldIDFromRef(idOrKey), id.NewKeyFromPtr(idOrKey))
	if f == nil {
		return FieldUpdate400Response{}, rerror.ErrNotFound
	}

	param := interfaces.UpdateFieldParam{
		FieldID:      f.ID(),
		ModelID:      m.ID().Ref(),
		SchemaID:     sch.ID(),
		Name:         request.Body.Key,
		Description:  nil,
		Key:          request.Body.Key,
		Multiple:     request.Body.Multiple,
		Unique:       lo.ToPtr(false),
		Required:     request.Body.Required,
		IsTitle:      lo.ToPtr(false),
		TypeProperty: nil,
		DefaultValue: nil,
	}
	f, err = uc.Schema.UpdateField(ctx, param, op)
	if err != nil {
		return FieldUpdate400Response{}, err
	}

	return FieldUpdate200JSONResponse{
		Id:       f.ID().Ref(),
		Key:      f.Key().Ref().StringRef(),
		Multiple: lo.ToPtr(f.Multiple()),
		Required: lo.ToPtr(f.Required()),
		Type:     lo.ToPtr(integrationapi.ToValueType(f.Type())),
	}, err
}

func (s *Server) FieldUpdateWithProject(ctx context.Context, request FieldUpdateWithProjectRequestObject) (FieldUpdateWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldUpdateWithProject400Response{}, err
		}
		return FieldUpdateWithProject400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldUpdateWithProject400Response{}, err
		}
		return FieldUpdateWithProject400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldUpdateWithProject400Response{}, err
		}
		return FieldUpdateWithProject400Response{}, err
	}

	idOrKey := (*string)(&request.FieldIdOrKey)
	f := sch.FieldByIDOrKey(id.FieldIDFromRef(idOrKey), id.NewKeyFromPtr(idOrKey))
	if f == nil {
		return FieldUpdateWithProject400Response{}, rerror.ErrNotFound
	}

	tp, dv, err := FromSchemaTypeProperty(*request.Body.Type, *request.Body.Multiple)
	if err != nil {
		return nil, err
	}

	param := interfaces.UpdateFieldParam{
		FieldID:      f.ID(),
		ModelID:      m.ID().Ref(),
		SchemaID:     sch.Schema().ID(),
		Name:         request.Body.Key,
		Description:  nil,
		Key:          request.Body.Key,
		Multiple:     request.Body.Multiple,
		Unique:       lo.ToPtr(false),
		Required:     request.Body.Required,
		IsTitle:      lo.ToPtr(false),
		TypeProperty: tp,
		DefaultValue: dv,
	}
	f, err = uc.Schema.UpdateField(ctx, param, op)
	if err != nil {
		return FieldUpdateWithProject400Response{}, err
	}

	return FieldUpdateWithProject200JSONResponse{
		Id:       f.ID().Ref(),
		Key:      f.Key().Ref().StringRef(),
		Multiple: lo.ToPtr(f.Multiple()),
		Required: lo.ToPtr(f.Required()),
		Type:     lo.ToPtr(integrationapi.ToValueType(f.Type())),
	}, err
}

func (s *Server) FieldDelete(ctx context.Context, request FieldDeleteRequestObject) (FieldDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	sch, err := uc.Schema.FindByID(ctx, request.SchemaId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldDelete400Response{}, err
		}
		return FieldDelete400Response{}, err
	}

	idOrKey := (*string)(&request.FieldIdOrKey)
	f := sch.FieldByIDOrKey(id.FieldIDFromRef(idOrKey), id.NewKeyFromPtr(idOrKey))
	if f == nil {
		return FieldDelete400Response{}, rerror.ErrNotFound
	}

	err = uc.Schema.DeleteField(ctx, sch.ID(), f.ID(), op)
	if err != nil {
		return FieldDelete400Response{}, err
	}

	return FieldDelete200JSONResponse{
		Id: f.ID().Ref(),
	}, err
}

func (s *Server) FieldDeleteWithProject(ctx context.Context, request FieldDeleteWithProjectRequestObject) (FieldDeleteWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldDeleteWithProject400Response{}, err
		}
		return FieldDeleteWithProject400Response{}, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldDeleteWithProject400Response{}, err
		}
		return FieldDeleteWithProject400Response{}, err
	}

	sch, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return FieldDeleteWithProject400Response{}, err
		}
		return FieldDeleteWithProject400Response{}, err
	}

	idOrKey := (*string)(&request.FieldIdOrKey)
	f := sch.FieldByIDOrKey(id.FieldIDFromRef(idOrKey), id.NewKeyFromPtr(idOrKey))
	if f == nil {
		return FieldDeleteWithProject400Response{}, rerror.ErrNotFound
	}

	err = uc.Schema.DeleteField(ctx, sch.Schema().ID(), f.ID(), op)
	if err != nil {
		return FieldDeleteWithProject400Response{}, err
	}

	return FieldDeleteWithProject200JSONResponse{
		Id: f.ID().Ref(),
	}, err
}

func FromSchemaTypeProperty(t integrationapi.ValueType, multiple bool) (tpRes *schema.TypeProperty, dv *value.Multiple, err error) {
	switch t {
	case integrationapi.ValueTypeText:
		tpRes = schema.NewText(nil).TypeProperty()
	case integrationapi.ValueTypeTextArea:
		tpRes = schema.NewTextArea(nil).TypeProperty()
	case integrationapi.ValueTypeRichText:
		tpRes = schema.NewRichText(nil).TypeProperty()
	case integrationapi.ValueTypeMarkdown:
		tpRes = schema.NewMarkdown(nil).TypeProperty()
	case integrationapi.ValueTypeAsset:
		tpRes = schema.NewAsset().TypeProperty()
	case integrationapi.ValueTypeDate:
		tpRes = schema.NewDateTime().TypeProperty()
	case integrationapi.ValueTypeBool:
		tpRes = schema.NewBool().TypeProperty()
	case integrationapi.ValueTypeCheckbox:
		tpRes = schema.NewCheckbox().TypeProperty()
	case integrationapi.ValueTypeSelect:
		// TODO: Select values
		res := schema.NewSelect(nil)
		tpRes = res.TypeProperty()
	case integrationapi.ValueTypeTag:
		// TODO: Tag values
		res, err := schema.NewFieldTag(nil)
		if err != nil {
			return nil, nil, err
		}
		tpRes = res.TypeProperty()
	case integrationapi.ValueTypeInteger:
		tpi, _ := schema.NewInteger(nil, nil)
		tpRes = tpi.TypeProperty()
	case integrationapi.ValueTypeNumber:
		tpi, _ := schema.NewNumber(nil, nil)
		tpRes = tpi.TypeProperty()
	case integrationapi.ValueTypeReference:
		if multiple {
			return nil, nil, ErrMultipleReference
		}
		return nil, nil, ErrNotImplemented
	case integrationapi.ValueTypeGroup:
		return nil, nil, ErrNotImplemented
	case integrationapi.ValueTypeUrl:
		tpRes = schema.NewURL().TypeProperty()
	case integrationapi.ValueTypeGeometryObject:
		tpRes = schema.NewGeometryObject(schema.GeometryAllSupportedTypes()).TypeProperty()
	case integrationapi.ValueTypeGeometryEditor:
		tpRes = schema.NewGeometryEditor(nil).TypeProperty()
	default:
		return nil, nil, ErrInvalidTypeProperty
	}
	return
}
