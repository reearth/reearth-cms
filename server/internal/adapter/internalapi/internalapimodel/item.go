package internalapimodel

import (
	"encoding/json"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/timestamppb"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

func ToItem(i *item.Item, sp *schema.Package) *pb.Item {
	if i == nil {
		return nil
	}

	var m = make(map[string]*anypb.Any)
	for k, v := range exporters.MapFromItem(i, sp, nil, nil) {
		if v == nil {
			continue
		}

		var err error
		m[k], err = WrapPrimitive(v)
		if err != nil {
			return nil
		}
	}

	return &pb.Item{
		Id:        i.ID().String(),
		Fields:    m,
		CreatedAt: timestamppb.New(i.ID().Timestamp()),
		UpdatedAt: timestamppb.New(i.Timestamp()),
	}
}

func WrapPrimitive(value any) (*anypb.Any, error) {
	switch v := value.(type) {
	case string:
		return anypb.New(wrapperspb.String(v))
	case *string:
		if v == nil {
			return nil, nil
		}
		return anypb.New(wrapperspb.String(*v))
	case int64:
		return anypb.New(wrapperspb.Int64(v))
	case int32:
		return anypb.New(wrapperspb.Int32(v))
	case int:
		return anypb.New(wrapperspb.Int32(int32(v)))
	case bool:
		return anypb.New(wrapperspb.Bool(v))
	case float32:
		return anypb.New(wrapperspb.Float(v))
	case float64:
		return anypb.New(wrapperspb.Double(v))
	default:
		jsonBytes, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		return anypb.New(wrapperspb.String(string(jsonBytes)))
	}
}
