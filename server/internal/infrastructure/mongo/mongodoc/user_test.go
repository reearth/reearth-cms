package mongodoc

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestNewUser(t *testing.T) {
	uId, wId := user.NewID(), user.NewWorkspaceID()
	tests := []struct {
		name   string
		user   *user.User
		want   *UserDocument
		uDocId string
	}{
		{
			name: "new doc",
			user: user.New().ID(uId).Name("abc").Email("a@b.c").Auths(nil).Workspace(wId).Theme(user.ThemeDefault).MustBuild(),
			want: &UserDocument{
				ID:            uId.String(),
				Name:          "abc",
				Email:         "a@b.c",
				Subs:          []string{},
				Workspace:     wId.String(),
				Lang:          language.Und.String(),
				Theme:         string(user.ThemeDefault),
				Password:      nil,
				PasswordReset: nil,
				Verification:  nil,
			},
			uDocId: uId.String(),
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, uDocId := NewUser(tt.user)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.uDocId, uDocId)
		})
	}
}

func TestNewUserConsumer(t *testing.T) {
	c := NewUserConsumer()
	assert.NotNil(t, c)
}

func TestPasswordResetDocument_Model(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name string
		pDoc *PasswordResetDocument
		want *user.PasswordReset
	}{
		{
			name: "Pass model",
			pDoc: &PasswordResetDocument{
				Token:     "xyz",
				CreatedAt: now,
			},
			want: &user.PasswordReset{
				Token:     "xyz",
				CreatedAt: now,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.pDoc.Model())
		})
	}
}

func TestUserDocument_Model(t *testing.T) {
	uId, wId := user.NewID(), user.NewWorkspaceID()
	tests := []struct {
		name    string
		uDoc    *UserDocument
		want    *user.User
		wantErr bool
	}{
		{
			name: "model",
			uDoc: &UserDocument{
				ID:            uId.String(),
				Name:          "abc",
				Email:         "a@b.c",
				Subs:          []string{},
				Workspace:     wId.String(),
				Lang:          language.Und.String(),
				Theme:         string(user.ThemeDefault),
				Password:      nil,
				PasswordReset: nil,
				Verification:  nil,
			},
			want:    user.New().ID(uId).Name("abc").Email("a@b.c").Auths(nil).Workspace(wId).Theme(user.ThemeDefault).MustBuild(),
			wantErr: false,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.uDoc.Model()
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
