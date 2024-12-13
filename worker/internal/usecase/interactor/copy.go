package interactor

import (
	"context"
)

func (u *Usecase) Copy(ctx context.Context, modelId, name string) error {
	panic("not implemented")
	// 	// copy model
	// oldModel, err := i.repos.Model.FindByID(ctx, modelId)
	// if err != nil {
	// 	return nil, err
	// }
	// name := lo.ToPtr(oldModel.Name() + " Copy")
	// if params.Name != nil {
	// 	name = params.Name
	// }
	// newModel, err := i.Create(ctx, interfaces.CreateModelParam{
	// 	ProjectId:   oldModel.Project(),
	// 	Name:        name,
	// 	Description: lo.ToPtr(oldModel.Description()),
	// 	Key:         id.RandomKey().Ref().StringRef(),
	// 	Public:      lo.ToPtr(oldModel.Public()),
	// }, operator)
	// if err != nil {
	// 	return nil, err
	// }
	// // copy schema
	// oldSchema, err := i.repos.Schema.FindByID(ctx, oldModel.Schema())
	// if err != nil {
	// 	return nil, err
	// }
	// newSchema, err := i.repos.Schema.FindByID(ctx, newModel.Schema())
	// if err != nil {
	// 	return nil, err
	// }
	// newSchema.CopyFrom(oldSchema)
	// err = i.repos.Schema.Save(ctx, newSchema)
	// if err != nil {
	// 	return nil, err
	// }
	// // copy items
	// // need to split into transactions of a batch of 100 items per transaction
	// oldItems, _, err := i.repos.Item.FindBySchema(ctx, oldSchema.ID(), nil, nil, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// newItems, err := util.TryMap(oldItems, func(oldItem item.Versioned) (*item.Item, error) {
	// 	newItem, buildErr := item.New().
	// 		NewID().
	// 		Schema(newSchema.ID()).
	// 		Model(newModel.ID()).
	// 		Fields(slices.Clone(oldItem.Value().Fields())).
	// 		Build()
	// 	if buildErr != nil {
	// 		return nil, buildErr
	// 	}
	// 	// should we copy items or versioned items?
	// 	// if versioned what should we do with parents and refs?
	// 	// vi := version.NewValue(version.New(), oldItem.Parents(), oldItem.Refs(), newItem.ID().Timestamp(), newItem)
	// 	return newItem, nil
	// })
	// if err != nil {
	// 	return nil, err
	// }
	// err = i.repos.Item.SaveAll(ctx, newItems)
	// if err != nil {
	// 	return nil, err
	// }

	// // copy metadata
	// if oldModel.Metadata() != nil {
	// 	// copy metadata schema
	// 	oldMetaSchema, err := i.repos.Schema.FindByID(ctx, *oldModel.Metadata())
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	newMetaSchema, err := schema.New().NewID().Workspace(oldMetaSchema.Workspace()).Project(oldMetaSchema.Project()).TitleField(nil).Build()
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	newMetaSchema.CopyFrom(oldMetaSchema)
	// 	err = i.repos.Schema.Save(ctx, newMetaSchema)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	// copy metadata items
	// 	oldMetaItems, _, err := i.repos.Item.FindBySchema(ctx, oldMetaSchema.ID(), nil, nil, nil)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	newMetaItems, err := util.TryMap(oldMetaItems, func(oldMetaItem item.Versioned) (*item.Item, error) {
	// 		newMetaItem, buildErr := item.New().
	// 			NewID().
	// 			Schema(newMetaSchema.ID()).
	// 			Model(newModel.ID()).
	// 			Fields(slices.Clone(oldMetaItem.Value().Fields())).
	// 			Build()
	// 		if buildErr != nil {
	// 			return nil, buildErr
	// 		}
	// 		// how about meta items? versioned or not?
	// 		return newMetaItem, nil
	// 	})
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// 	err = i.repos.Item.SaveAll(ctx, newMetaItems)
	// 	if err != nil {
	// 		return nil, err
	// 	}
	// }

	// // copy group items

	// // copy referenced items

	// return newModel, nil
}
