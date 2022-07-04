// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package gqlmodel

import (
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"golang.org/x/text/language"
)

type Node interface {
	IsNode()
}

type SchemaFieldTypeProperties interface {
	IsSchemaFieldTypeProperties()
}

type AddMemberToWorkspaceInput struct {
	WorkspaceID ID   `json:"workspaceId"`
	UserID      ID   `json:"userId"`
	Role        Role `json:"role"`
}

type AddMemberToWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type CreateFieldInput struct {
	ModelID      ID          `json:"modelId"`
	Type         FiledType   `json:"type"`
	Title        string      `json:"title"`
	Description  *string     `json:"description"`
	Key          string      `json:"key"`
	IsMultiValue *bool       `json:"isMultiValue"`
	DefaultValue interface{} `json:"DefaultValue"`
	Values       interface{} `json:"values"`
	IsUnique     *bool       `json:"isUnique"`
	IsRequired   *bool       `json:"isRequired"`
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

type CreateWorkspaceInput struct {
	Name string `json:"name"`
}

type CreateWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type DeleteFieldInput struct {
	FieldID ID `json:"fieldId"`
}

type DeleteFieldPayload struct {
	FieldID ID `json:"fieldId"`
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

type DeleteWorkspaceInput struct {
	WorkspaceID ID `json:"workspaceId"`
}

type DeleteWorkspacePayload struct {
	WorkspaceID ID `json:"workspaceId"`
}

type FieldPayload struct {
	Field *SchemaField `json:"field"`
}

type KeyAvailability struct {
	Key       string `json:"key"`
	Available bool   `json:"available"`
}

type Me struct {
	ID            ID           `json:"id"`
	Name          string       `json:"name"`
	Email         string       `json:"email"`
	Lang          language.Tag `json:"lang"`
	Theme         Theme        `json:"theme"`
	MyWorkspaceID ID           `json:"myWorkspaceId"`
	Auths         []string     `json:"auths"`
	Workspaces    []*Workspace `json:"workspaces"`
	MyWorkspace   *Workspace   `json:"myWorkspace"`
}

type Model struct {
	ID          ID        `json:"id"`
	ProjectID   ID        `json:"projectId"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Key         string    `json:"key"`
	Project     *Project  `json:"project"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Model) IsNode() {}

type ModelConnection struct {
	Edges      []*ModelEdge `json:"edges"`
	Nodes      []*Model     `json:"nodes"`
	PageInfo   *PageInfo    `json:"pageInfo"`
	TotalCount int          `json:"totalCount"`
}

type ModelEdge struct {
	Cursor usecase.Cursor `json:"cursor"`
	Node   *Model         `json:"node"`
}

type ModelPayload struct {
	Model *Model `json:"model"`
}

type PageInfo struct {
	StartCursor     *usecase.Cursor `json:"startCursor"`
	EndCursor       *usecase.Cursor `json:"endCursor"`
	HasNextPage     bool            `json:"hasNextPage"`
	HasPreviousPage bool            `json:"hasPreviousPage"`
}

type Pagination struct {
	First  *int            `json:"first"`
	Last   *int            `json:"last"`
	After  *usecase.Cursor `json:"after"`
	Before *usecase.Cursor `json:"before"`
}

type Project struct {
	ID          ID         `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Alias       string     `json:"alias"`
	WorkspaceID ID         `json:"workspaceId"`
	Workspace   *Workspace `json:"workspace"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (Project) IsNode() {}

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
	Cursor usecase.Cursor `json:"cursor"`
	Node   *Project       `json:"node"`
}

type ProjectPayload struct {
	Project *Project `json:"project"`
}

type PublishModelInput struct {
	ModelID ID   `json:"modelId"`
	Status  bool `json:"status"`
}

type RemoveMemberFromWorkspaceInput struct {
	WorkspaceID ID `json:"workspaceId"`
	UserID      ID `json:"userId"`
}

type RemoveMemberFromWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type RemoveMyAuthInput struct {
	Auth string `json:"auth"`
}

type SchemaAssetFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaAssetFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaBoolFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaBoolFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaDateFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaDateFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaField struct {
	ID             ID                        `json:"id"`
	ModelID        ID                        `json:"modelId"`
	Model          *Model                    `json:"model"`
	TypeProperties SchemaFieldTypeProperties `json:"typeProperties"`
	Key            string                    `json:"key"`
	Title          string                    `json:"title"`
	Description    *string                   `json:"description"`
	MultiValue     *bool                     `json:"multiValue"`
	DefaultValue   interface{}               `json:"defaultValue"`
	Unique         *bool                     `json:"unique"`
	Required       *bool                     `json:"required"`
	CreatedAt      time.Time                 `json:"createdAt"`
	UpdatedAt      time.Time                 `json:"updatedAt"`
}

type SchemaIntegerFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaIntegerFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaMarkdownTextFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaMarkdownTextFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaReferenceFieldProperties struct {
	ReferencedModelID *ID `json:"referencedModelId"`
}

func (SchemaReferenceFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaRichTextFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaRichTextFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaSelectFieldProperties struct {
	Values interface{} `json:"values"`
}

func (SchemaSelectFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaTagFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaTagFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaTextAreaFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaTextAreaFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaTextFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaTextFieldProperties) IsSchemaFieldTypeProperties() {}

type SchemaURLFieldProperties struct {
	F interface{} `json:"_f"`
}

func (SchemaURLFieldProperties) IsSchemaFieldTypeProperties() {}

type SignupInput struct {
	Lang        *language.Tag `json:"lang"`
	Theme       *Theme        `json:"theme"`
	UserID      *ID           `json:"userId"`
	WorkspaceID *ID           `json:"workspaceId"`
	Secret      *string       `json:"secret"`
}

type SignupPayload struct {
	User      *User      `json:"user"`
	Workspace *Workspace `json:"workspace"`
}

type UpdateFieldInput struct {
	Title        *string     `json:"title"`
	Description  *string     `json:"description"`
	Key          *string     `json:"key"`
	IsMultiValue *bool       `json:"isMultiValue"`
	DefaultValue interface{} `json:"DefaultValue"`
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

type UpdateMemberOfWorkspaceInput struct {
	WorkspaceID ID   `json:"workspaceId"`
	UserID      ID   `json:"userId"`
	Role        Role `json:"role"`
}

type UpdateMemberOfWorkspacePayload struct {
	Workspace *Workspace `json:"workspace"`
}

type UpdateModelInput struct {
	ModelID     ID      `json:"modelId"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Key         *string `json:"key"`
}

type UpdateProjectInput struct {
	ProjectID   ID      `json:"projectId"`
	Name        *string `json:"name"`
	Description *string `json:"description"`
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

func (User) IsNode() {}

type Workspace struct {
	ID       ID                 `json:"id"`
	Name     string             `json:"name"`
	Members  []*WorkspaceMember `json:"members"`
	Personal bool               `json:"personal"`
}

func (Workspace) IsNode() {}

type WorkspaceMember struct {
	UserID ID    `json:"userId"`
	Role   Role  `json:"role"`
	User   *User `json:"user"`
}

type FiledType string

const (
	FiledTypeText         FiledType = "Text"
	FiledTypeTextArea     FiledType = "TextArea"
	FiledTypeRichText     FiledType = "RichText"
	FiledTypeMarkdownText FiledType = "MarkdownText"
	FiledTypeAsset        FiledType = "Asset"
	FiledTypeDate         FiledType = "Date"
	FiledTypeBool         FiledType = "Bool"
	FiledTypeSelect       FiledType = "Select"
	FiledTypeTag          FiledType = "Tag"
	FiledTypeInteger      FiledType = "Integer"
	FiledTypeReference    FiledType = "Reference"
	FiledTypeURL          FiledType = "URL"
)

var AllFiledType = []FiledType{
	FiledTypeText,
	FiledTypeTextArea,
	FiledTypeRichText,
	FiledTypeMarkdownText,
	FiledTypeAsset,
	FiledTypeDate,
	FiledTypeBool,
	FiledTypeSelect,
	FiledTypeTag,
	FiledTypeInteger,
	FiledTypeReference,
	FiledTypeURL,
}

func (e FiledType) IsValid() bool {
	switch e {
	case FiledTypeText, FiledTypeTextArea, FiledTypeRichText, FiledTypeMarkdownText, FiledTypeAsset, FiledTypeDate, FiledTypeBool, FiledTypeSelect, FiledTypeTag, FiledTypeInteger, FiledTypeReference, FiledTypeURL:
		return true
	}
	return false
}

func (e FiledType) String() string {
	return string(e)
}

func (e *FiledType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = FiledType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid FiledType", str)
	}
	return nil
}

func (e FiledType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type NodeType string

const (
	NodeTypeUser      NodeType = "USER"
	NodeTypeWorkspace NodeType = "WORKSPACE"
	NodeTypeProject   NodeType = "PROJECT"
)

var AllNodeType = []NodeType{
	NodeTypeUser,
	NodeTypeWorkspace,
	NodeTypeProject,
}

func (e NodeType) IsValid() bool {
	switch e {
	case NodeTypeUser, NodeTypeWorkspace, NodeTypeProject:
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

type Role string

const (
	RoleReader Role = "READER"
	RoleWriter Role = "WRITER"
	RoleOwner  Role = "OWNER"
)

var AllRole = []Role{
	RoleReader,
	RoleWriter,
	RoleOwner,
}

func (e Role) IsValid() bool {
	switch e {
	case RoleReader, RoleWriter, RoleOwner:
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
