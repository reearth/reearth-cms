package project

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewAccessibility_WithPosting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		posting *PostingSettings
		wantNil bool
	}{
		{
			name:    "nil posting stays nil",
			posting: nil,
			wantNil: true,
		},
		{
			name:    "posting settings are stored",
			posting: mustNewPS(t, nil),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			a := NewAccessibility(VisibilityPublic, nil, tt.posting, nil)
			if tt.wantNil {
				assert.Nil(t, a.Posting())
			} else {
				assert.NotNil(t, a.Posting())
			}
		})
	}
}

func TestAccessibility_Posting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		a           *Accessibility
		wantNil     bool
		wantOrigins []string
	}{
		{name: "nil receiver", a: nil, wantNil: true},
		{name: "nil posting", a: &Accessibility{}, wantNil: true},
		{name: "posting without origins", a: &Accessibility{posting: &PostingSettings{}}, wantNil: false, wantOrigins: []string{}},
		{name: "posting with origins", a: &Accessibility{posting: &PostingSettings{allowedOrigins: []string{"https://a.com"}}}, wantNil: false, wantOrigins: []string{"https://a.com"}},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := tt.a.Posting()
			if tt.wantNil {
				assert.Nil(t, got)
			} else {
				assert.NotNil(t, got)
				assert.Equal(t, tt.wantOrigins, got.AllowedOrigins())
			}
		})
	}
}

func TestAccessibility_PostingEnabled(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		a    *Accessibility
		want bool
	}{
		{name: "nil receiver defaults to false", a: nil, want: false},
		{name: "nil posting defaults to false", a: &Accessibility{}, want: false},
		{name: "posting disabled (empty origins)", a: &Accessibility{posting: mustNewPS(t, []string{})}, want: false},
		{name: "posting enabled", a: &Accessibility{posting: mustNewPS(t, []string{"https://example.com"})}, want: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.want, tt.a.PostingEnabled())
		})
	}
}

func TestAccessibility_SetPosting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		initial    *Accessibility
		input      *PostingSettings
		wantNil    bool
		wantCloned bool
	}{
		{
			name:    "nil receiver is a no-op",
			initial: nil,
			input:   mustNewPS(t, nil),
		},
		{
			name:    "set nil clears posting",
			initial: &Accessibility{posting: mustNewPS(t, nil)},
			input:   nil,
			wantNil: true,
		},
		{
			name:       "set non-nil stores a clone",
			initial:    &Accessibility{},
			input:      mustNewPS(t, nil),
			wantCloned: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.NotPanics(t, func() { tt.initial.SetPosting(tt.input) })
			if tt.initial == nil {
				return
			}
			if tt.wantNil {
				assert.Nil(t, tt.initial.posting)
				return
			}
			assert.NotNil(t, tt.initial.posting)
			if tt.wantCloned {
				assert.NotSame(t, tt.input, tt.initial.posting)
			}
		})
	}
}

func TestAccessibility_Clone_IncludesPosting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		a       *Accessibility
		wantNil bool
	}{
		{
			name: "clone preserves posting and produces a distinct pointer",
			a:    &Accessibility{posting: mustNewPS(t, []string{"https://a.com"})},
		},
		{
			name:    "clone with nil posting produces nil posting",
			a:       &Accessibility{},
			wantNil: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			c := tt.a.Clone()
			if tt.wantNil {
				assert.Nil(t, c.Posting())
				return
			}
			assert.Equal(t, tt.a.posting.AllowedOrigins(), c.Posting().AllowedOrigins())
			assert.NotSame(t, tt.a.posting, c.posting)
		})
	}
}

func TestAccessibility_IsAssetsPublic(t *testing.T) {
	t.Parallel()

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
		tt := tt
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
	t.Parallel()

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
		tt := tt
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
