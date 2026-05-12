package adapter

import (
	"context"
	"testing"

	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/stretchr/testify/assert"
	"golang.org/x/text/language"
)

func TestLang(t *testing.T) {
	ctx := context.Background()
	wId := accountdomain.NewWorkspaceID()
	uId := accountdomain.NewUserID()

	tests := []struct {
		name         string
		setupCtx     func() context.Context
		inputLang    *language.Tag
		expectedLang string
		description  string
	}{
		{
			name: "parameter lang takes precedence when not root",
			setupCtx: func() context.Context {
				return ctx
			},
			inputLang:    &[]language.Tag{language.Japanese}[0],
			expectedLang: "ja",
			description:  "When lang parameter is provided and not root, it should be returned",
		},
		{
			name: "parameter lang is root, falls back to user metadata",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.French)
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    &[]language.Tag{language.Und}[0],
			expectedLang: "fr",
			description:  "When lang parameter is root, should use user metadata language",
		},
		{
			name: "no parameter lang, uses user metadata",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.Japanese)
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "ja",
			description:  "When no lang parameter, should use user metadata language",
		},
		{
			name: "user metadata lang is root, returns default",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.Und)
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "en",
			description:  "When user metadata lang is root/undefined, should return default 'en'",
		},
		{
			name: "user has no metadata, returns default",
			setupCtx: func() context.Context {
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "en",
			description:  "When user has no metadata, should return default 'en'",
		},
		{
			name: "no user in context, returns default",
			setupCtx: func() context.Context {
				return ctx
			},
			inputLang:    nil,
			expectedLang: "en",
			description:  "When no user in context, should return default 'en'",
		},
		{
			name: "user metadata is nil, returns default",
			setupCtx: func() context.Context {
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(nil).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "en",
			description:  "When user metadata is explicitly nil, should return default 'en' without panic",
		},
		{
			name: "user with German language",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.German)
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "de",
			description:  "Should correctly return German language code",
		},
		{
			name: "user with language region variant",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.MustParse("en-GB"))
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    nil,
			expectedLang: "en-GB",
			description:  "Should preserve language region variants",
		},
		{
			name: "parameter lang overrides user metadata",
			setupCtx: func() context.Context {
				metadata := user.NewMetadata()
				metadata.SetLang(language.Japanese)
				u := user.New().
					ID(uId).
					Name("test").
					Email("test@example.com").
					Workspace(wId).
					Metadata(metadata).
					MustBuild()
				return AttachUser(ctx, u)
			},
			inputLang:    &[]language.Tag{language.French}[0],
			expectedLang: "fr",
			description:  "Parameter lang should take precedence over user metadata",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			testCtx := tt.setupCtx()
			result := Lang(testCtx, tt.inputLang)
			assert.Equal(t, tt.expectedLang, result, tt.description)
		})
	}
}

func TestLang_NoPanic(t *testing.T) {
	t.Run("should not panic with nil metadata", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		wId := accountdomain.NewWorkspaceID()
		uId := accountdomain.NewUserID()

		u := user.New().
			ID(uId).
			Name("test").
			Email("test@example.com").
			Workspace(wId).
			Metadata(nil).
			MustBuild()

		ctx = AttachUser(ctx, u)

		// This should not panic
		assert.NotPanics(t, func() {
			result := Lang(ctx, nil)
			assert.Equal(t, "en", result)
		})
	})

	t.Run("should not panic with no user", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()

		// This should not panic
		assert.NotPanics(t, func() {
			result := Lang(ctx, nil)
			assert.Equal(t, "en", result)
		})
	})
}
