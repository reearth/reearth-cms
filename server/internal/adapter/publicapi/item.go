package publicApi

import "context"

func (*Controller) GetItem(ctx context.Context, prj, id string) (Item, error) {
	panic("implement")
}

func (*Controller) GetItems(ctx context.Context, prj, schema string) (ListResult[Item], error) {
	panic("implement")
}
