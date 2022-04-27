package memory

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/reearth/reearth-cms/server/pkg/util"
	"github.com/stretchr/testify/assert"
)

func TestNewUser(t *testing.T) {
	expected := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}

	got := NewUser()
	assert.Equal(t, expected, got)
}

func TestUser_FindBySub(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").Auths([]user.Auth{{
		Sub: "xxx",
	}}).MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)

	tests := []struct {
		name     string
		repo     *User
		auth0sub string
		want     *user.User
		wantErr  bool
	}{
		{
			name:     "must find user by auth",
			repo:     r,
			auth0sub: "xxx",
			want:     u,
			wantErr:  false,
		},
		{
			name:     "must return ErrInvalidParams",
			repo:     &User{},
			auth0sub: "",
			wantErr:  true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, err := tc.repo.FindBySub(ctx, tc.auth0sub)
			if tc.wantErr {
				assert.Error(tt, err)
			} else {
				assert.Equal(tt, tc.want, got)
			}
		})
	}
}

func TestUser_FindByEmail(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)
	out, err := r.FindByEmail(ctx, "aa@bb.cc")
	assert.NoError(t, err)
	assert.Equal(t, u, out)

	out, err = r.FindByEmail(ctx, "abc@bb.cc")
	assert.Same(t, rerror.ErrNotFound, err)
	assert.Nil(t, out)
}

func TestUser_FindByIDs(t *testing.T) {
	ctx := context.Background()
	u1 := user.New().NewID().Name("hoge").Email("abc@bb.cc").MustBuild()
	u2 := user.New().NewID().Name("foo").Email("cba@bb.cc").MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u1.ID(), u1)
	r.data.Store(u2.ID(), u2)

	ids := id.UserIDList{
		u1.ID(),
		u2.ID(),
	}
	expected := []*user.User{u1, u2}
	out, err := r.FindByIDs(ctx, ids)
	assert.NoError(t, err)
	assert.Equal(t, expected, out)
}

func TestUser_FindByName(t *testing.T) {
	ctx := context.Background()
	pr := user.PasswordReset{
		Token: "123abc",
	}
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").PasswordReset(pr.Clone()).MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)

	tests := []struct {
		name    string
		repo    *User
		uName   string
		want    *user.User
		wantErr bool
	}{
		{
			name:    "must find user by name",
			repo:    r,
			uName:   "hoge",
			want:    u,
			wantErr: false,
		},
		{
			name:    "must return ErrInvalidParams",
			repo:    &User{},
			wantErr: true,
		},
		{
			name:    "must return ErrNotFound",
			repo:    &User{},
			uName:   "xxx",
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, err := tc.repo.FindByName(ctx, tc.uName)
			if tc.wantErr {
				assert.Error(tt, err)
			} else {
				assert.Equal(tt, tc.want, got)
			}
		})
	}
}

func TestUser_FindByNameOrEmail(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)

	out, err := r.FindByNameOrEmail(ctx, "hoge")
	assert.NoError(t, err)
	assert.Equal(t, u, out)

	_, err = r.FindByNameOrEmail(ctx, "aa@bb.cc")
	assert.NoError(t, err)
	assert.Equal(t, u, out)

	_, err = r.FindByNameOrEmail(ctx, "xxx")
	assert.Same(t, rerror.ErrNotFound, err)
}

func TestUser_FindByPasswordResetRequest(t *testing.T) {
	ctx := context.Background()
	pr := user.PasswordReset{
		Token: "123abc",
	}
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").PasswordReset(pr.Clone()).MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)

	tests := []struct {
		name    string
		repo    *User
		token   string
		want    *user.User
		wantErr bool
	}{
		{
			name:    "must find user by password reset",
			repo:    r,
			token:   "123abc",
			want:    u,
			wantErr: false,
		},
		{
			name:    "must return ErrInvalidParams",
			repo:    &User{},
			wantErr: true,
		},
		{
			name:    "must return ErrNotFound",
			repo:    &User{},
			token:   "xxx",
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, err := tc.repo.FindByPasswordResetRequest(ctx, tc.token)
			if tc.wantErr {
				assert.Error(tt, err)
			} else {
				assert.Equal(tt, tc.want, got)
			}
		})
	}
}

func TestUser_FindByVerification(t *testing.T) {
	ctx := context.Background()
	vr := user.VerificationFrom("123abc", time.Now(), false)
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").Verification(vr).MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)
	tests := []struct {
		name    string
		repo    *User
		code    string
		want    *user.User
		wantErr bool
	}{
		{
			name:    "must find user by verification",
			repo:    r,
			code:    "123abc",
			want:    u,
			wantErr: false,
		},
		{
			name:    "must return ErrInvalidParams",
			repo:    &User{},
			wantErr: true,
		},
		{
			name:    "must return ErrNotFound",
			repo:    &User{},
			code:    "xxx",
			wantErr: true,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			got, err := tc.repo.FindByVerification(ctx, tc.code)
			if tc.wantErr {
				assert.Error(tt, err)
			} else {
				assert.Equal(tt, tc.want, got)
			}
		})
	}
}

func TestUser_Remove(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").MustBuild()
	u2 := user.New().NewID().Name("xxx").Email("abc@bb.cc").MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)
	r.data.Store(u2.ID(), u2)

	_ = r.Remove(ctx, u2.ID())
	assert.Equal(t, 1, r.data.Len())
}

func TestUser_Save(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").MustBuild()

	got := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	_ = got.Save(ctx, u)

	assert.Equal(t, 1, got.data.Len())
}

func TestUser_FindByID(t *testing.T) {
	ctx := context.Background()
	u := user.New().NewID().Name("hoge").Email("aa@bb.cc").MustBuild()
	r := &User{
		data: util.SyncMap[id.UserID, *user.User]{},
	}
	r.data.Store(u.ID(), u)

	out, err := r.FindByID(ctx, u.ID())
	assert.NoError(t, err)
	assert.Equal(t, u, out)

	_, err = r.FindByID(ctx, id.UserID{})
	assert.Same(t, rerror.ErrNotFound, err)
}
