// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package gqlmodel

import (
	"fmt"
	"io"
	"net/url"
	"strconv"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearthx/usecasex"
	"golang.org/x/text/language"
)

type Node interface {
	IsNode()
	GetID() ID
}

type Operator interface {
	IsOperator()
}

type SchemaFieldTypeProperty interface {
	IsSchemaFieldTypeProperty()
}

type WorkspaceMember interface {
	IsWorkspaceMember()
}

type AddCommentInput struct {
	ThreadID ID     `json:"threadId"`
	Content  string `json:"content"`
}

type AddIntegrationToWorkspaceInput struct {
	WorkspaceID   ID   `json:"workspaceId"`
	IntegrationID ID   `json:"integrationId"`
	Role          Role `json:"role"`
}

type AddUsersToWorkspaceInput struct {
	WorkspaceID ID             `json:"workspaceId"`
	Users       []*MemberInput `json:"users"`
}

type AddUsersToWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type ApproveRequestInput struct {
	RequestID ID `json:"requestId"`
}

type Asset struct {
	ID                      ID                       `json:"id"`
	Project                 *Project                 `json:"project"`
	ProjectID               ID                       `json:"projectId"`
	CreatedAt               time.Time                `json:"createdAt"`
	CreatedBy               Operator                 `json:"createdBy"`
	CreatedByType           OperatorType             `json:"createdByType"`
	CreatedByID             ID                       `json:"createdById"`
	FileName                string                   `json:"fileName"`
	Size                    int64                    `json:"size"`
	PreviewType             *PreviewType             `json:"previewType"`
	File                    *AssetFile               `json:"file"`
	UUID                    string                   `json:"uuid"`
	Thread                  *Thread                  `json:"thread"`
	ThreadID                ID                       `json:"threadId"`
	URL                     string                   `json:"url"`
	ArchiveExtractionStatus *ArchiveExtractionStatus `json:"archiveExtractionStatus"`
}

func (Asset) IsNode()        {}
func (this Asset) GetID() ID { return this.ID }

type AssetConnection struct {
	Edges      []*AssetEdge `json:"edges"`
	Nodes      []*Asset     `json:"nodes"`
	PageInfo   *PageInfo    `json:"pageInfo"`
	TotalCount int          `json:"totalCount"`
}

type AssetEdge struct {
	Cursor usecasex.Cursor `json:"cursor"`
	Node   *Asset          `json:"node"`
}

type AssetFile struct {
	Name        string       `json:"name"`
	Size        int64        `json:"size"`
	ContentType *string      `json:"contentType"`
	Path        string       `json:"path"`
	Children    []*AssetFile `json:"children"`
}

type Comment struct {
	ID         ID           `json:"id"`
	Author     Operator     `json:"author"`
	AuthorType OperatorType `json:"authorType"`
	AuthorID   ID           `json:"authorId"`
	Content    string       `json:"content"`
	CreatedAt  time.Time    `json:"createdAt"`
}

type CommentPayload struct {
	Thread  *Thread  `json:"thread"`
	Comment *Comment `json:"comment"`
}

type CreateAssetInput struct {
	ProjectID ID              `json:"projectId"`
	File      *graphql.Upload `json:"file"`
	URL       *string         `json:"url"`
}

type CreateAssetPayload struct {
	Asset *Asset `json:"asset"`
}

type CreateFieldInput struct {
	ModelID      ID                            `json:"modelId"`
	Type         SchemaFieldType               `json:"type"`
	Title        string                        `json:"title"`
	Description  *string                       `json:"description"`
	Key          string                        `json:"key"`
	Multiple     bool                          `json:"multiple"`
	Unique       bool                          `json:"unique"`
	Required     bool                          `json:"required"`
	TypeProperty *SchemaFieldTypePropertyInput `json:"typeProperty"`
}

type CreateIntegrationInput struct {
	Name        string          `json:"name"`
	Description *string         `json:"description"`
	LogoURL     url.URL         `json:"logoUrl"`
	Type        IntegrationType `json:"type"`
}

type CreateItemInput struct {
	SchemaID ID                `json:"schemaId"`
	ModelID  ID                `json:"modelId"`
	Fields   []*ItemFieldInput `json:"fields"`
}

type CreateModelInput struct {
	ProjectID   ID      `json:"projectId"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Key         *string `json:"key"`
}

type CreateProjectInput struct {
	WorkspaceID ID      `json:"workspaceId"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Alias       *string `json:"alias"`
}

type CreateRequestInput struct {
	ProjectID   ID                  `json:"projectId"`
	Title       string              `json:"title"`
	Description *string             `json:"description"`
	State       *RequestState       `json:"state"`
	ReviewersID []ID                `json:"reviewersId"`
	Items       []*RequestItemInput `json:"items"`
}

type CreateThreadInput struct {
	WorkspaceID ID `json:"workspaceId"`
}

type CreateWebhookInput struct {
	IntegrationID ID                   `json:"integrationId"`
	Name          string               `json:"name"`
	URL           url.URL              `json:"url"`
	Active        bool                 `json:"active"`
	Trigger       *WebhookTriggerInput `json:"trigger"`
	Secret        string               `json:"secret"`
}

type CreateWorkspaceInput struct {
	Name string `json:"name"`
}

type CreateWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type DeleteAssetInput struct {
	AssetID ID `json:"assetId"`
}

type DeleteAssetPayload struct {
	AssetID ID `json:"assetId"`
}

type DeleteCommentInput struct {
	ThreadID  ID `json:"threadId"`
	CommentID ID `json:"commentId"`
}

type DeleteCommentPayload struct {
	Thread    *Thread `json:"thread"`
	CommentID ID      `json:"commentId"`
}

type DeleteFieldInput struct {
	ModelID ID `json:"modelId"`
	FieldID ID `json:"fieldId"`
}

type DeleteFieldPayload struct {
	FieldID ID `json:"fieldId"`
}

type DeleteIntegrationInput struct {
	IntegrationID ID `json:"integrationId"`
}

type DeleteIntegrationPayload struct {
	IntegrationID ID `json:"integrationId"`
}

type DeleteItemInput struct {
	ItemID ID `json:"itemId"`
}

type DeleteItemPayload struct {
	ItemID ID `json:"itemId"`
}

type DeleteMeInput struct {
	UserID ID `json:"userId"`
}

type DeleteMePayload struct {
	UserID ID `json:"userId"`
}

type DeleteModelInput struct {
	ModelID ID `json:"modelId"`
}

type DeleteModelPayload struct {
	ModelID ID `json:"modelId"`
}

type DeleteProjectInput struct {
	ProjectID ID `json:"projectId"`
}

type DeleteProjectPayload struct {
	ProjectID ID `json:"projectId"`
}

type DeleteRequestInput struct {
	ProjectID  ID   `json:"projectId"`
	RequestsID []ID `json:"requestsId"`
}

type DeleteRequestPayload struct {
	Requests []ID `json:"requests"`
}

type DeleteWebhookInput struct {
	IntegrationID ID `json:"integrationId"`
	WebhookID     ID `json:"webhookId"`
}

type DeleteWebhookPayload struct {
	WebhookID ID `json:"webhookId"`
}

type DeleteWorkspaceInput struct {
	WorkspaceID ID `json:"workspaceId"`
}

type DeleteWorkspacePayload struct {
	WorkspaceID ID `json:"workspaceId"`
}

type FieldPayload struct {
	Field *SchemaField `json:"field"`
}

type Integration struct {
	ID          ID                 `json:"id"`
	Name        string             `json:"name"`
	Description *string            `json:"description"`
	LogoURL     url.URL            `json:"logoUrl"`
	IType       IntegrationType    `json:"iType"`
	DeveloperID ID                 `json:"developerId"`
	Developer   *User              `json:"developer"`
	Config      *IntegrationConfig `json:"config"`
	CreatedAt   time.Time          `json:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt"`
}

func (Integration) IsOperator() {}

func (Integration) IsNode()        {}
func (this Integration) GetID() ID { return this.ID }

type IntegrationConfig struct {
	Token    string     `json:"token"`
	Webhooks []*Webhook `json:"webhooks"`
}

type IntegrationPayload struct {
	Integration *Integration `json:"integration"`
}

type Item struct {
	ID        ID           `json:"id"`
	SchemaID  ID           `json:"schemaId"`
	ThreadID  ID           `json:"threadId"`
	ModelID   ID           `json:"modelId"`
	ProjectID ID           `json:"projectId"`
	Schema    *Schema      `json:"schema"`
	Project   *Project     `json:"project"`
	Thread    *Thread      `json:"thread"`
	Fields    []*ItemField `json:"fields"`
	CreatedAt time.Time    `json:"createdAt"`
}

func (Item) IsNode()        {}
func (this Item) GetID() ID { return this.ID }

type ItemConnection struct {
	Edges      []*ItemEdge `json:"edges"`
	Nodes      []*Item     `json:"nodes"`
	PageInfo   *PageInfo   `json:"pageInfo"`
	TotalCount int         `json:"totalCount"`
}

type ItemEdge struct {
	Cursor usecasex.Cursor `json:"cursor"`
	Node   *Item           `json:"node"`
}

type ItemField struct {
	SchemaFieldID ID              `json:"schemaFieldId"`
	Type          SchemaFieldType `json:"type"`
	Value         interface{}     `json:"value"`
}

type ItemFieldInput struct {
	SchemaFieldID ID              `json:"schemaFieldId"`
	Type          SchemaFieldType `json:"type"`
	Value         interface{}     `json:"value"`
}

type ItemPayload struct {
	Item *Item `json:"item"`
}

type ItemQuery struct {
	Project ID      `json:"project"`
	Q       *string `json:"q"`
}

type KeyAvailability struct {
	Key       string `json:"key"`
	Available bool   `json:"available"`
}

type Me struct {
	ID            ID             `json:"id"`
	Name          string         `json:"name"`
	Email         string         `json:"email"`
	Lang          language.Tag   `json:"lang"`
	Theme         Theme          `json:"theme"`
	MyWorkspaceID ID             `json:"myWorkspaceId"`
	Auths         []string       `json:"auths"`
	Workspaces    []*Workspace   `json:"workspaces"`
	MyWorkspace   *Workspace     `json:"myWorkspace"`
	Integrations  []*Integration `json:"integrations"`
}

type MemberInput struct {
	UserID ID   `json:"userId"`
	Role   Role `json:"role"`
}

type Model struct {
	ID          ID        `json:"id"`
	ProjectID   ID        `json:"projectId"`
	SchemaID    ID        `json:"schemaId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Key         string    `json:"key"`
	Project     *Project  `json:"project"`
	Schema      *Schema   `json:"schema"`
	Public      bool      `json:"public"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Model) IsNode()        {}
func (this Model) GetID() ID { return this.ID }

type ModelConnection struct {
	Edges      []*ModelEdge `json:"edges"`
	Nodes      []*Model     `json:"nodes"`
	PageInfo   *PageInfo    `json:"pageInfo"`
	TotalCount int          `json:"totalCount"`
}

type ModelEdge struct {
	Cursor usecasex.Cursor `json:"cursor"`
	Node   *Model          `json:"node"`
}

type ModelPayload struct {
	Model *Model `json:"model"`
}

type PageInfo struct {
	StartCursor     *usecasex.Cursor `json:"startCursor"`
	EndCursor       *usecasex.Cursor `json:"endCursor"`
	HasNextPage     bool             `json:"hasNextPage"`
	HasPreviousPage bool             `json:"hasPreviousPage"`
}

type Pagination struct {
	First  *int             `json:"first"`
	Last   *int             `json:"last"`
	After  *usecasex.Cursor `json:"after"`
	Before *usecasex.Cursor `json:"before"`
}

type Project struct {
	ID          ID                  `json:"id"`
	Name        string              `json:"name"`
	Description string              `json:"description"`
	Alias       string              `json:"alias"`
	WorkspaceID ID                  `json:"workspaceId"`
	Workspace   *Workspace          `json:"workspace"`
	CreatedAt   time.Time           `json:"createdAt"`
	UpdatedAt   time.Time           `json:"updatedAt"`
	Publication *ProjectPublication `json:"publication"`
}

func (Project) IsNode()        {}
func (this Project) GetID() ID { return this.ID }

type ProjectAliasAvailability struct {
	Alias     string `json:"alias"`
	Available bool   `json:"available"`
}

type ProjectConnection struct {
	Edges      []*ProjectEdge `json:"edges"`
	Nodes      []*Project     `json:"nodes"`
	PageInfo   *PageInfo      `json:"pageInfo"`
	TotalCount int            `json:"totalCount"`
}

type ProjectEdge struct {
	Cursor usecasex.Cursor `json:"cursor"`
	Node   *Project        `json:"node"`
}

type ProjectPayload struct {
	Project *Project `json:"project"`
}

type ProjectPublication struct {
	Scope       ProjectPublicationScope `json:"scope"`
	AssetPublic bool                    `json:"assetPublic"`
}

type PublishModelInput struct {
	ModelID ID   `json:"modelId"`
	Status  bool `json:"status"`
}

type PublishModelPayload struct {
	ModelID ID   `json:"modelId"`
	Status  bool `json:"status"`
}

type RemoveIntegrationFromWorkspaceInput struct {
	WorkspaceID   ID `json:"workspaceId"`
	IntegrationID ID `json:"integrationId"`
}

type RemoveMemberFromWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type RemoveMyAuthInput struct {
	Auth string `json:"auth"`
}

type RemoveUserFromWorkspaceInput struct {
	WorkspaceID ID `json:"workspaceId"`
	UserID      ID `json:"userId"`
}

type Request struct {
	ID          ID             `json:"id"`
	Items       []*RequestItem `json:"items"`
	Title       string         `json:"title"`
	Description *string        `json:"description"`
	CreatedByID ID             `json:"createdById"`
	WorkspaceID ID             `json:"workspaceId"`
	ProjectID   ID             `json:"projectId"`
	ThreadID    ID             `json:"threadId"`
	ReviewersID []ID           `json:"reviewersId"`
	State       RequestState   `json:"state"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	ApprovedAt  *time.Time     `json:"approvedAt"`
	ClosedAt    *time.Time     `json:"closedAt"`
	Thread      *Thread        `json:"thread"`
	CreatedBy   *User          `json:"createdBy"`
	Workspace   *Workspace     `json:"workspace"`
	Project     *Project       `json:"project"`
	Reviewers   []*User        `json:"reviewers"`
}

func (Request) IsNode()        {}
func (this Request) GetID() ID { return this.ID }

type RequestConnection struct {
	Edges      []*RequestEdge `json:"edges"`
	Nodes      []*Request     `json:"nodes"`
	PageInfo   *PageInfo      `json:"pageInfo"`
	TotalCount int            `json:"totalCount"`
}

type RequestEdge struct {
	Cursor usecasex.Cursor `json:"cursor"`
	Node   *Request        `json:"node"`
}

type RequestItem struct {
	ItemID    ID             `json:"itemId"`
	Version   *string        `json:"version"`
	Ref       *string        `json:"ref"`
	Item      *Item          `json:"item"`
	Versioned *VersionedItem `json:"versioned"`
}

type RequestItemInput struct {
	ItemID ID `json:"itemId"`
}

type RequestPayload struct {
	Request *Request `json:"request"`
}

type Schema struct {
	ID        ID             `json:"id"`
	ProjectID ID             `json:"projectId"`
	Fields    []*SchemaField `json:"fields"`
	Project   *Project       `json:"project"`
}

func (Schema) IsNode()        {}
func (this Schema) GetID() ID { return this.ID }

type SchemaField struct {
	ID           ID                      `json:"id"`
	ModelID      ID                      `json:"modelId"`
	Model        *Model                  `json:"model"`
	Type         SchemaFieldType         `json:"type"`
	TypeProperty SchemaFieldTypeProperty `json:"typeProperty"`
	Key          string                  `json:"key"`
	Title        string                  `json:"title"`
	Description  *string                 `json:"description"`
	Multiple     bool                    `json:"multiple"`
	Unique       bool                    `json:"unique"`
	Required     bool                    `json:"required"`
	CreatedAt    time.Time               `json:"createdAt"`
	UpdatedAt    time.Time               `json:"updatedAt"`
}

type SchemaFieldAsset struct {
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldAsset) IsSchemaFieldTypeProperty() {}

type SchemaFieldAssetInput struct {
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaFieldBool struct {
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldBool) IsSchemaFieldTypeProperty() {}

type SchemaFieldBoolInput struct {
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaFieldDate struct {
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldDate) IsSchemaFieldTypeProperty() {}

type SchemaFieldDateInput struct {
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaFieldInteger struct {
	DefaultValue interface{} `json:"defaultValue"`
	Min          *int        `json:"min"`
	Max          *int        `json:"max"`
}

func (SchemaFieldInteger) IsSchemaFieldTypeProperty() {}

type SchemaFieldIntegerInput struct {
	DefaultValue interface{} `json:"defaultValue"`
	Min          *int        `json:"min"`
	Max          *int        `json:"max"`
}

type SchemaFieldMarkdown struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

func (SchemaFieldMarkdown) IsSchemaFieldTypeProperty() {}

type SchemaFieldReference struct {
	ModelID ID `json:"modelId"`
}

func (SchemaFieldReference) IsSchemaFieldTypeProperty() {}

type SchemaFieldReferenceInput struct {
	ModelID ID `json:"modelId"`
}

type SchemaFieldRichText struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

func (SchemaFieldRichText) IsSchemaFieldTypeProperty() {}

type SchemaFieldRichTextInput struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

type SchemaFieldSelect struct {
	Values       []string    `json:"values"`
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldSelect) IsSchemaFieldTypeProperty() {}

type SchemaFieldSelectInput struct {
	Values       []string    `json:"values"`
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaFieldTag struct {
	Values       []string    `json:"values"`
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldTag) IsSchemaFieldTypeProperty() {}

type SchemaFieldTagInput struct {
	Values       []string    `json:"values"`
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaFieldText struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

func (SchemaFieldText) IsSchemaFieldTypeProperty() {}

type SchemaFieldTextArea struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

func (SchemaFieldTextArea) IsSchemaFieldTypeProperty() {}

type SchemaFieldTextAreaInput struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

type SchemaFieldTextInput struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

type SchemaFieldTypePropertyInput struct {
	Text         *SchemaFieldTextInput      `json:"text"`
	TextArea     *SchemaFieldTextAreaInput  `json:"textArea"`
	RichText     *SchemaFieldRichTextInput  `json:"richText"`
	MarkdownText *SchemaMarkdownTextInput   `json:"markdownText"`
	Asset        *SchemaFieldAssetInput     `json:"asset"`
	Date         *SchemaFieldDateInput      `json:"date"`
	Bool         *SchemaFieldBoolInput      `json:"bool"`
	Select       *SchemaFieldSelectInput    `json:"select"`
	Tag          *SchemaFieldTagInput       `json:"tag"`
	Integer      *SchemaFieldIntegerInput   `json:"integer"`
	Reference    *SchemaFieldReferenceInput `json:"reference"`
	URL          *SchemaFieldURLInput       `json:"url"`
}

type SchemaFieldURL struct {
	DefaultValue interface{} `json:"defaultValue"`
}

func (SchemaFieldURL) IsSchemaFieldTypeProperty() {}

type SchemaFieldURLInput struct {
	DefaultValue interface{} `json:"defaultValue"`
}

type SchemaMarkdownTextInput struct {
	DefaultValue interface{} `json:"defaultValue"`
	MaxLength    *int        `json:"maxLength"`
}

type Thread struct {
	ID          ID         `json:"id"`
	Workspace   *Workspace `json:"workspace"`
	WorkspaceID ID         `json:"workspaceId"`
	Comments    []*Comment `json:"comments"`
}

type ThreadPayload struct {
	Thread *Thread `json:"thread"`
}

type UpdateAssetInput struct {
	ID          ID           `json:"id"`
	PreviewType *PreviewType `json:"previewType"`
}

type UpdateAssetPayload struct {
	Asset *Asset `json:"asset"`
}

type UpdateCommentInput struct {
	ThreadID  ID     `json:"threadId"`
	CommentID ID     `json:"commentId"`
	Content   string `json:"content"`
}

type UpdateFieldInput struct {
	ModelID      ID                            `json:"modelId"`
	FieldID      ID                            `json:"fieldId"`
	Title        *string                       `json:"title"`
	Description  *string                       `json:"description"`
	Key          *string                       `json:"key"`
	Required     *bool                         `json:"required"`
	Unique       *bool                         `json:"unique"`
	Multiple     *bool                         `json:"multiple"`
	TypeProperty *SchemaFieldTypePropertyInput `json:"typeProperty"`
}

type UpdateIntegrationInput struct {
	IntegrationID ID       `json:"integrationId"`
	Name          *string  `json:"name"`
	Description   *string  `json:"description"`
	LogoURL       *url.URL `json:"logoUrl"`
}

type UpdateIntegrationOfWorkspaceInput struct {
	WorkspaceID   ID   `json:"workspaceId"`
	IntegrationID ID   `json:"integrationId"`
	Role          Role `json:"role"`
}

type UpdateItemInput struct {
	ItemID ID                `json:"itemId"`
	Fields []*ItemFieldInput `json:"fields"`
}

type UpdateMeInput struct {
	Name                 *string       `json:"name"`
	Email                *string       `json:"email"`
	Lang                 *language.Tag `json:"lang"`
	Theme                *Theme        `json:"theme"`
	Password             *string       `json:"password"`
	PasswordConfirmation *string       `json:"passwordConfirmation"`
}

type UpdateMePayload struct {
	Me *Me `json:"me"`
}

type UpdateMemberOfWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type UpdateModelInput struct {
	ModelID     ID      `json:"modelId"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Key         *string `json:"key"`
	Public      bool    `json:"public"`
}

type UpdateProjectInput struct {
	ProjectID   ID                             `json:"projectId"`
	Name        *string                        `json:"name"`
	Description *string                        `json:"description"`
	Publication *UpdateProjectPublicationInput `json:"publication"`
}

type UpdateProjectPublicationInput struct {
	Scope       *ProjectPublicationScope `json:"scope"`
	AssetPublic *bool                    `json:"assetPublic"`
}

type UpdateRequestInput struct {
	RequestID   ID                  `json:"requestId"`
	Title       *string             `json:"title"`
	Description *string             `json:"description"`
	State       *RequestState       `json:"state"`
	ReviewersID []ID                `json:"reviewersId"`
	Items       []*RequestItemInput `json:"items"`
}

type UpdateUserOfWorkspaceInput struct {
	WorkspaceID ID   `json:"workspaceId"`
	UserID      ID   `json:"userId"`
	Role        Role `json:"role"`
}

type UpdateWebhookInput struct {
	IntegrationID ID                   `json:"integrationId"`
	WebhookID     ID                   `json:"webhookId"`
	Name          *string              `json:"name"`
	URL           *url.URL             `json:"url"`
	Active        *bool                `json:"active"`
	Trigger       *WebhookTriggerInput `json:"trigger"`
	Secret        *string              `json:"secret"`
}

type UpdateWorkspaceInput struct {
	WorkspaceID ID     `json:"workspaceId"`
	Name        string `json:"name"`
}

type UpdateWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type User struct {
	ID    ID     `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

func (User) IsOperator() {}

func (User) IsNode()        {}
func (this User) GetID() ID { return this.ID }

type VersionedItem struct {
	Version string   `json:"version"`
	Parents []string `json:"parents"`
	Refs    []string `json:"refs"`
	Value   *Item    `json:"value"`
}

type Webhook struct {
	ID        ID              `json:"id"`
	Name      string          `json:"name"`
	URL       url.URL         `json:"url"`
	Active    bool            `json:"active"`
	Trigger   *WebhookTrigger `json:"trigger"`
	Secret    string          `json:"secret"`
	CreatedAt time.Time       `json:"createdAt"`
	UpdatedAt time.Time       `json:"updatedAt"`
}

type WebhookPayload struct {
	Webhook *Webhook `json:"webhook"`
}

type WebhookTrigger struct {
	OnItemCreate      *bool `json:"onItemCreate"`
	OnItemUpdate      *bool `json:"onItemUpdate"`
	OnItemDelete      *bool `json:"onItemDelete"`
	OnItemPublish     *bool `json:"onItemPublish"`
	OnItemUnPublish   *bool `json:"onItemUnPublish"`
	OnAssetUpload     *bool `json:"onAssetUpload"`
	OnAssetDecompress *bool `json:"onAssetDecompress"`
	OnAssetDelete     *bool `json:"onAssetDelete"`
}

type WebhookTriggerInput struct {
	OnItemCreate      *bool `json:"onItemCreate"`
	OnItemUpdate      *bool `json:"onItemUpdate"`
	OnItemDelete      *bool `json:"onItemDelete"`
	OnItemPublish     *bool `json:"onItemPublish"`
	OnItemUnPublish   *bool `json:"onItemUnPublish"`
	OnAssetUpload     *bool `json:"onAssetUpload"`
	OnAssetDecompress *bool `json:"onAssetDecompress"`
	OnAssetDelete     *bool `json:"onAssetDelete"`
}

type Workspace struct {
	ID       ID                `json:"id"`
	Name     string            `json:"name"`
	Members  []WorkspaceMember `json:"members"`
	Personal bool              `json:"personal"`
}

func (Workspace) IsNode()        {}
func (this Workspace) GetID() ID { return this.ID }

type WorkspaceIntegrationMember struct {
	IntegrationID ID           `json:"integrationId"`
	Role          Role         `json:"role"`
	Active        bool         `json:"active"`
	InvitedByID   ID           `json:"invitedById"`
	InvitedBy     *User        `json:"invitedBy"`
	Integration   *Integration `json:"integration"`
}

func (WorkspaceIntegrationMember) IsWorkspaceMember() {}

type WorkspaceUserMember struct {
	UserID ID    `json:"userId"`
	Role   Role  `json:"role"`
	User   *User `json:"user"`
}

func (WorkspaceUserMember) IsWorkspaceMember() {}

type ArchiveExtractionStatus string

const (
	ArchiveExtractionStatusPending    ArchiveExtractionStatus = "PENDING"
	ArchiveExtractionStatusInProgress ArchiveExtractionStatus = "IN_PROGRESS"
	ArchiveExtractionStatusDone       ArchiveExtractionStatus = "DONE"
	ArchiveExtractionStatusFailed     ArchiveExtractionStatus = "FAILED"
)

var AllArchiveExtractionStatus = []ArchiveExtractionStatus{
	ArchiveExtractionStatusPending,
	ArchiveExtractionStatusInProgress,
	ArchiveExtractionStatusDone,
	ArchiveExtractionStatusFailed,
}

func (e ArchiveExtractionStatus) IsValid() bool {
	switch e {
	case ArchiveExtractionStatusPending, ArchiveExtractionStatusInProgress, ArchiveExtractionStatusDone, ArchiveExtractionStatusFailed:
		return true
	}
	return false
}

func (e ArchiveExtractionStatus) String() string {
	return string(e)
}

func (e *ArchiveExtractionStatus) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = ArchiveExtractionStatus(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid ArchiveExtractionStatus", str)
	}
	return nil
}

func (e ArchiveExtractionStatus) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type AssetSortType string

const (
	AssetSortTypeDate AssetSortType = "DATE"
	AssetSortTypeSize AssetSortType = "SIZE"
	AssetSortTypeName AssetSortType = "NAME"
)

var AllAssetSortType = []AssetSortType{
	AssetSortTypeDate,
	AssetSortTypeSize,
	AssetSortTypeName,
}

func (e AssetSortType) IsValid() bool {
	switch e {
	case AssetSortTypeDate, AssetSortTypeSize, AssetSortTypeName:
		return true
	}
	return false
}

func (e AssetSortType) String() string {
	return string(e)
}

func (e *AssetSortType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = AssetSortType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid AssetSortType", str)
	}
	return nil
}

func (e AssetSortType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type IntegrationType string

const (
	IntegrationTypePublic  IntegrationType = "Public"
	IntegrationTypePrivate IntegrationType = "Private"
)

var AllIntegrationType = []IntegrationType{
	IntegrationTypePublic,
	IntegrationTypePrivate,
}

func (e IntegrationType) IsValid() bool {
	switch e {
	case IntegrationTypePublic, IntegrationTypePrivate:
		return true
	}
	return false
}

func (e IntegrationType) String() string {
	return string(e)
}

func (e *IntegrationType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = IntegrationType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid IntegrationType", str)
	}
	return nil
}

func (e IntegrationType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type NodeType string

const (
	NodeTypeUser        NodeType = "USER"
	NodeTypeWorkspace   NodeType = "WORKSPACE"
	NodeTypeProject     NodeType = "PROJECT"
	NodeTypeAsset       NodeType = "ASSET"
	NodeTypeRequest     NodeType = "REQUEST"
	NodeTypeModel       NodeType = "Model"
	NodeTypeSchema      NodeType = "Schema"
	NodeTypeItem        NodeType = "Item"
	NodeTypeIntegration NodeType = "Integration"
)

var AllNodeType = []NodeType{
	NodeTypeUser,
	NodeTypeWorkspace,
	NodeTypeProject,
	NodeTypeAsset,
	NodeTypeRequest,
	NodeTypeModel,
	NodeTypeSchema,
	NodeTypeItem,
	NodeTypeIntegration,
}

func (e NodeType) IsValid() bool {
	switch e {
	case NodeTypeUser, NodeTypeWorkspace, NodeTypeProject, NodeTypeAsset, NodeTypeRequest, NodeTypeModel, NodeTypeSchema, NodeTypeItem, NodeTypeIntegration:
		return true
	}
	return false
}

func (e NodeType) String() string {
	return string(e)
}

func (e *NodeType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = NodeType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid NodeType", str)
	}
	return nil
}

func (e NodeType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type OperatorType string

const (
	OperatorTypeUser        OperatorType = "User"
	OperatorTypeIntegration OperatorType = "Integration"
)

var AllOperatorType = []OperatorType{
	OperatorTypeUser,
	OperatorTypeIntegration,
}

func (e OperatorType) IsValid() bool {
	switch e {
	case OperatorTypeUser, OperatorTypeIntegration:
		return true
	}
	return false
}

func (e OperatorType) String() string {
	return string(e)
}

func (e *OperatorType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = OperatorType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid OperatorType", str)
	}
	return nil
}

func (e OperatorType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type PreviewType string

const (
	PreviewTypeImage   PreviewType = "IMAGE"
	PreviewTypeGeo     PreviewType = "GEO"
	PreviewTypeGeo3d   PreviewType = "GEO3D"
	PreviewTypeModel3d PreviewType = "MODEL3D"
	PreviewTypeUnknown PreviewType = "UNKNOWN"
)

var AllPreviewType = []PreviewType{
	PreviewTypeImage,
	PreviewTypeGeo,
	PreviewTypeGeo3d,
	PreviewTypeModel3d,
	PreviewTypeUnknown,
}

func (e PreviewType) IsValid() bool {
	switch e {
	case PreviewTypeImage, PreviewTypeGeo, PreviewTypeGeo3d, PreviewTypeModel3d, PreviewTypeUnknown:
		return true
	}
	return false
}

func (e PreviewType) String() string {
	return string(e)
}

func (e *PreviewType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = PreviewType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid PreviewType", str)
	}
	return nil
}

func (e PreviewType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type ProjectPublicationScope string

const (
	ProjectPublicationScopePublic  ProjectPublicationScope = "PUBLIC"
	ProjectPublicationScopeLimited ProjectPublicationScope = "LIMITED"
	ProjectPublicationScopePrivate ProjectPublicationScope = "PRIVATE"
)

var AllProjectPublicationScope = []ProjectPublicationScope{
	ProjectPublicationScopePublic,
	ProjectPublicationScopeLimited,
	ProjectPublicationScopePrivate,
}

func (e ProjectPublicationScope) IsValid() bool {
	switch e {
	case ProjectPublicationScopePublic, ProjectPublicationScopeLimited, ProjectPublicationScopePrivate:
		return true
	}
	return false
}

func (e ProjectPublicationScope) String() string {
	return string(e)
}

func (e *ProjectPublicationScope) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = ProjectPublicationScope(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid ProjectPublicationScope", str)
	}
	return nil
}

func (e ProjectPublicationScope) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type RequestState string

const (
	RequestStateDraft    RequestState = "DRAFT"
	RequestStateWaiting  RequestState = "WAITING"
	RequestStateClosed   RequestState = "CLOSED"
	RequestStateApproved RequestState = "APPROVED"
)

var AllRequestState = []RequestState{
	RequestStateDraft,
	RequestStateWaiting,
	RequestStateClosed,
	RequestStateApproved,
}

func (e RequestState) IsValid() bool {
	switch e {
	case RequestStateDraft, RequestStateWaiting, RequestStateClosed, RequestStateApproved:
		return true
	}
	return false
}

func (e RequestState) String() string {
	return string(e)
}

func (e *RequestState) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = RequestState(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid RequestState", str)
	}
	return nil
}

func (e RequestState) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type Role string

const (
	RoleReader     Role = "READER"
	RoleWriter     Role = "WRITER"
	RoleOwner      Role = "OWNER"
	RoleMaintainer Role = "MAINTAINER"
)

var AllRole = []Role{
	RoleReader,
	RoleWriter,
	RoleOwner,
	RoleMaintainer,
}

func (e Role) IsValid() bool {
	switch e {
	case RoleReader, RoleWriter, RoleOwner, RoleMaintainer:
		return true
	}
	return false
}

func (e Role) String() string {
	return string(e)
}

func (e *Role) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Role(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Role", str)
	}
	return nil
}

func (e Role) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type SchemaFieldType string

const (
	SchemaFieldTypeText         SchemaFieldType = "Text"
	SchemaFieldTypeTextArea     SchemaFieldType = "TextArea"
	SchemaFieldTypeRichText     SchemaFieldType = "RichText"
	SchemaFieldTypeMarkdownText SchemaFieldType = "MarkdownText"
	SchemaFieldTypeAsset        SchemaFieldType = "Asset"
	SchemaFieldTypeDate         SchemaFieldType = "Date"
	SchemaFieldTypeBool         SchemaFieldType = "Bool"
	SchemaFieldTypeSelect       SchemaFieldType = "Select"
	SchemaFieldTypeTag          SchemaFieldType = "Tag"
	SchemaFieldTypeInteger      SchemaFieldType = "Integer"
	SchemaFieldTypeReference    SchemaFieldType = "Reference"
	SchemaFieldTypeURL          SchemaFieldType = "URL"
)

var AllSchemaFieldType = []SchemaFieldType{
	SchemaFieldTypeText,
	SchemaFieldTypeTextArea,
	SchemaFieldTypeRichText,
	SchemaFieldTypeMarkdownText,
	SchemaFieldTypeAsset,
	SchemaFieldTypeDate,
	SchemaFieldTypeBool,
	SchemaFieldTypeSelect,
	SchemaFieldTypeTag,
	SchemaFieldTypeInteger,
	SchemaFieldTypeReference,
	SchemaFieldTypeURL,
}

func (e SchemaFieldType) IsValid() bool {
	switch e {
	case SchemaFieldTypeText, SchemaFieldTypeTextArea, SchemaFieldTypeRichText, SchemaFieldTypeMarkdownText, SchemaFieldTypeAsset, SchemaFieldTypeDate, SchemaFieldTypeBool, SchemaFieldTypeSelect, SchemaFieldTypeTag, SchemaFieldTypeInteger, SchemaFieldTypeReference, SchemaFieldTypeURL:
		return true
	}
	return false
}

func (e SchemaFieldType) String() string {
	return string(e)
}

func (e *SchemaFieldType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = SchemaFieldType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid SchemaFieldType", str)
	}
	return nil
}

func (e SchemaFieldType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type Theme string

const (
	ThemeDefault Theme = "DEFAULT"
	ThemeLight   Theme = "LIGHT"
	ThemeDark    Theme = "DARK"
)

var AllTheme = []Theme{
	ThemeDefault,
	ThemeLight,
	ThemeDark,
}

func (e Theme) IsValid() bool {
	switch e {
	case ThemeDefault, ThemeLight, ThemeDark:
		return true
	}
	return false
}

func (e Theme) String() string {
	return string(e)
}

func (e *Theme) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Theme(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Theme", str)
	}
	return nil
}

func (e Theme) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
