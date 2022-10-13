package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
)

type userRepo struct {
	client *mongox.ClientCollection
}

func NewUser(client *mongox.Client) repo.User {
	r := &userRepo{client: client.WithCollection("user")}
	r.init()
	return r
}

func (r *userRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"subs", "name"}, []string{"id", "email"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "user", i)
	}
}

func (r *userRepo) FindByIDs(ctx context.Context, ids id.UserIDList) ([]*user.User, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
	if err != nil {
		return nil, err
	}
	return filterUsers(ids, res), nil
}

func (r *userRepo) FindByID(ctx context.Context, id2 id.UserID) (*user.User, error) {
	return r.findOne(ctx, bson.M{"id": id2.String()})
}

func (r *userRepo) FindBySub(ctx context.Context, auth0sub string) (*user.User, error) {
	return r.findOne(ctx, bson.M{
		"$or": []bson.M{
			{
				"subs": bson.M{
					"$elemMatch": bson.M{
						"$eq": auth0sub,
					},
				},
			},
		},
	})
}

func (r *userRepo) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"email": email})
}

func (r *userRepo) FindByName(ctx context.Context, name string) (*user.User, error) {
	return r.findOne(ctx, bson.M{"name": name})
}

func (r *userRepo) FindByNameOrEmail(ctx context.Context, nameOrEmail string) (*user.User, error) {
	return r.findOne(ctx, bson.M{
		"$or": []bson.M{
			{"email": nameOrEmail},
			{"name": nameOrEmail},
		},
	})
}

func (r *userRepo) FindByVerification(ctx context.Context, code string) (*user.User, error) {
	return r.findOne(ctx, bson.M{
		"verification.code": code,
	})
}

func (r *userRepo) FindByPasswordResetRequest(ctx context.Context, pwdResetToken string) (*user.User, error) {
	return r.findOne(ctx, bson.M{
		"passwordreset.token": pwdResetToken,
	})
}

func (r *userRepo) FindBySubOrCreate(ctx context.Context, user *user.User, sub string) (*user.User, error) {
	userDoc, _ := mongodoc.NewUser(user)
	if err := r.client.Client().FindOneAndUpdate(
		ctx,
		bson.M{
			"$or": []bson.M{
				{
					"subs": bson.M{
						"$elemMatch": bson.M{
							"$eq": sub,
						},
					},
				},
			},
		},
		bson.M{"$setOnInsert": userDoc},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	).Decode(&userDoc); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return nil, repo.ErrDuplicatedUser
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return userDoc.Model()
}

func (r *userRepo) Create(ctx context.Context, user *user.User) error {
	doc, _ := mongodoc.NewUser(user)
	if _, err := r.client.Client().InsertOne(
		ctx,
		doc,
	); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return repo.ErrDuplicatedUser
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *userRepo) Save(ctx context.Context, user *user.User) error {
	doc, id := mongodoc.NewUser(user)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *userRepo) Remove(ctx context.Context, user id.UserID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": user.String()})
}

func (r *userRepo) find(ctx context.Context, filter any) ([]*user.User, error) {
	c := mongodoc.NewUserConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *userRepo) findOne(ctx context.Context, filter any) (*user.User, error) {
	c := mongodoc.NewUserConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func filterUsers(ids []id.UserID, rows []*user.User) []*user.User {
	res := make([]*user.User, 0, len(ids))
	for _, id := range ids {
		var r2 *user.User
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}
