package project

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestAccessibility_IsAssetsPublic(t *testing.T) {
	apiKey1 := NewAPIKeyBuilder().
		NewID().
		GenerateKey().
		Publication(NewPublicationSettings(ModelIDList{}, true)).
		Build()
	apiKey2 := NewAPIKeyBuilder().
		NewID().
		GenerateKey().
		Publication(NewPublicationSettings(ModelIDList{}, false)).
		Build()

	type fields struct {
		visibility  Visibility
		publication *PublicationSettings
		apiKeys     APIKeys
	}
	type args struct {
		keyId *APIKeyID
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   bool
	}{
		{
			name:   "empty visibility",
			fields: fields{},
			args:   args{keyId: nil},
			want:   false,
		},
		{
			name:   "private visibility",
			fields: fields{visibility: VisibilityPrivate},
			args:   args{keyId: nil},
			want:   false,
		},
		{
			name:   "public visibility",
			fields: fields{visibility: VisibilityPublic},
			args:   args{keyId: nil},
			want:   true,
		},
		{
			name:   "private visibility, publication allows public assets",
			fields: fields{visibility: VisibilityPrivate, publication: NewPublicationSettings(nil, true)},
			args:   args{keyId: nil},
			want:   true,
		},
		{
			name:   "private visibility, publication does not allow public assets",
			fields: fields{visibility: VisibilityPrivate, publication: NewPublicationSettings(nil, false)},
			args:   args{keyId: nil},
			want:   false,
		},
		{
			name:   "private visibility, API key allows public assets",
			fields: fields{visibility: VisibilityPrivate, publication: NewPublicationSettings(nil, false), apiKeys: APIKeys{apiKey1}},
			args:   args{keyId: &apiKey1.id},
			want:   true,
		},
		{
			name:   "private visibility, API key does not allow public assets",
			fields: fields{visibility: VisibilityPrivate, publication: NewPublicationSettings(nil, false), apiKeys: APIKeys{apiKey2}},
			args:   args{keyId: &apiKey2.id},
			want:   false,
		},
		{
			name:   "private visibility, API key not found",
			fields: fields{visibility: VisibilityPrivate, publication: NewPublicationSettings(nil, false), apiKeys: APIKeys{apiKey1}},
			args:   args{keyId: &apiKey2.id},
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &Accessibility{
				visibility:  tt.fields.visibility,
				publication: tt.fields.publication,
				apiKeys:     tt.fields.apiKeys,
			}
			assert.Equal(t, tt.want, p.IsAssetsPublic(tt.args.keyId))
		})
	}
}

func TestAccessibility_IsModelPublic(t *testing.T) {
	modelID := id.NewModelID()
	pubWithModel := NewPublicationSettings(ModelIDList{modelID}, false)
	pubWithoutModel := NewPublicationSettings(ModelIDList{}, false)

	apiKeyModel := NewAPIKeyBuilder().
		NewID().
		GenerateKey().
		Publication(NewPublicationSettings(ModelIDList{modelID}, false)).
		Build()
	apiKeyNoModel := NewAPIKeyBuilder().
		NewID().
		GenerateKey().
		Publication(NewPublicationSettings(ModelIDList{}, false)).
		Build()
	keyID := apiKeyModel.ID()
	otherKeyID := apiKeyNoModel.ID()

	type fields struct {
		visibility  Visibility
		publication *PublicationSettings
		apiKeys     APIKeys
	}
	type args struct {
		modelID id.ModelID
		keyId   *APIKeyID
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   bool
	}{
		{
			name:   "empty visibility",
			fields: fields{},
			args:   args{modelID: modelID, keyId: nil},
			want:   false,
		},
		{
			name:   "private visibility",
			fields: fields{visibility: VisibilityPrivate},
			args:   args{modelID: modelID, keyId: nil},
			want:   false,
		},
		{
			name:   "public visibility",
			fields: fields{visibility: VisibilityPublic},
			args:   args{modelID: modelID, keyId: nil},
			want:   true,
		},
		{
			name:   "private visibility, publication allows public model",
			fields: fields{visibility: VisibilityPrivate, publication: pubWithModel},
			args:   args{modelID: modelID, keyId: nil},
			want:   true,
		},
		{
			name:   "private visibility, publication does not allow public model",
			fields: fields{visibility: VisibilityPrivate, publication: pubWithoutModel},
			args:   args{modelID: modelID, keyId: nil},
			want:   false,
		},
		{
			name:   "private visibility, API key allows public model",
			fields: fields{visibility: VisibilityPrivate, publication: pubWithoutModel, apiKeys: APIKeys{apiKeyModel}},
			args:   args{modelID: modelID, keyId: &keyID},
			want:   true,
		},
		{
			name:   "private visibility, API key does not allow public model",
			fields: fields{visibility: VisibilityPrivate, publication: pubWithoutModel, apiKeys: APIKeys{apiKeyNoModel}},
			args:   args{modelID: modelID, keyId: &otherKeyID},
			want:   false,
		},
		{
			name:   "private visibility, API key not found",
			fields: fields{visibility: VisibilityPrivate, publication: pubWithoutModel, apiKeys: APIKeys{apiKeyModel}},
			args:   args{modelID: modelID, keyId: &otherKeyID},
			want:   false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			p := &Accessibility{
				visibility:  tt.fields.visibility,
				publication: tt.fields.publication,
				apiKeys:     tt.fields.apiKeys,
			}
			assert.Equal(t, tt.want, p.IsModelPublic(tt.args.modelID, tt.args.keyId))
		})
	}
}
