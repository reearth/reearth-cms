package project

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestNewAccessibility_WithPosting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		posting     *PostingSettings
		wantEnabled bool
		wantNil     bool
	}{
		{
			name:    "nil posting — PostingEnabled returns false",
			posting: nil,
			wantNil: true,
		},
		{
			name:        "posting enabled — PostingEnabled returns true",
			posting:     mustNewPS(t, true, nil),
			wantEnabled: true,
		},
		{
			name:        "posting disabled — PostingEnabled returns false",
			posting:     mustNewPS(t, false, nil),
			wantEnabled: false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			a := NewAccessibility(VisibilityPublic, nil, tt.posting, nil)
			assert.Equal(t, tt.wantEnabled, a.PostingEnabled())
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
		name    string
		a       *Accessibility
		wantNil bool
		want    bool
	}{
		{name: "nil receiver", a: nil, wantNil: true},
		{name: "nil posting", a: &Accessibility{}, wantNil: true},
		{name: "posting disabled", a: &Accessibility{posting: &PostingSettings{enabled: false}}, wantNil: false, want: false},
		{name: "posting enabled", a: &Accessibility{posting: &PostingSettings{enabled: true}}, wantNil: false, want: true},
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
				assert.Equal(t, tt.want, got.Enabled())
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
		{name: "nil receiver", a: nil, want: false},
		{name: "nil posting", a: &Accessibility{}, want: false},
		{name: "posting disabled", a: &Accessibility{posting: &PostingSettings{enabled: false}}, want: false},
		{name: "posting enabled", a: &Accessibility{posting: &PostingSettings{enabled: true}}, want: true},
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
		name        string
		initial     *Accessibility
		input       *PostingSettings
		wantNil     bool
		wantEnabled bool
		wantCloned  bool
	}{
		{
			name:    "nil receiver is a no-op",
			initial: nil,
			input:   mustNewPS(t, true, nil),
		},
		{
			name:    "set nil clears posting",
			initial: &Accessibility{posting: mustNewPS(t, true, nil)},
			input:   nil,
			wantNil: true,
		},
		{
			name:        "set non-nil stores a clone",
			initial:     &Accessibility{},
			input:       mustNewPS(t, true, nil),
			wantEnabled: true,
			wantCloned:  true,
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
			assert.Equal(t, tt.wantEnabled, tt.initial.PostingEnabled())
			if tt.wantCloned {
				assert.NotSame(t, tt.input, tt.initial.posting)
			}
		})
	}
}

func TestAccessibility_Clone_IncludesPosting(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		a           *Accessibility
		wantNil     bool
		wantEnabled bool
	}{
		{
			name:        "clone preserves posting and produces a distinct pointer",
			a:           &Accessibility{posting: mustNewPS(t, true, nil)},
			wantEnabled: true,
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
			assert.Equal(t, tt.wantEnabled, c.PostingEnabled())
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
