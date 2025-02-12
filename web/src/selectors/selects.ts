export const Selectors = {
  // I Workspace selectors

  // Workspace Creation Modal selectors
  workspaceHeaderButtonCreateWorkspace: "workspace-header-button-create-workspace",
  workspaceCreationModalInputName: "workspace-creation-modal-input-name",
  workspaceCreationModalButtonOk: "workspace-creation-modal-button-ok",

  // Workspace Header Search Input selectors
  workspaceHeaderSearchInput: "workspace-header-search-input",

  // Workspace Settings Update selectors
  workspaceSettingsButtonWorkspace: "workspace-settings-button-workspace",
  workspaceSettingsInputName: "workspace-setting-input-name",
  workspaceSettingsButtonSave: "workspace-setting-button-save",
  workspaceSettingsButtonRemoveWorkspace: "workspace-settings-button-remove-workspace",

  // Workspace Settings Menu Item selector
  workspaceSettingsMenuItem: "workspace-settings-menu-item",

  // Workspace Create  Header selectors
  workspacePersonalAccount: "personal-account",
  workspaceCreateButton: "create-workspace-button",

  // Workspace Settings Danger Zone selectors
  workspaceSettingsDangerZoneButtonDelete: "workspace-settings-danger-zone-button-delete",
  workspaceSettingsDangerZoneButtonDeleteConfirmOk: "workspace-delete-confirm-ok",

  // Current Workspace selector
  currentWorkspace: (workspaceId: string) => `current-workspace-${workspaceId}`,

  // II Project selectors

  // Project Settings Page selectors
  projectCreationModalInputName: "project-creation-modal-input-name",
  projectCreationModalInputAlias: "project-creation-modal-input-alias",
  projectCreationModalTextareaDescription: "project-creation-modal-textarea-description",
  projectCreationModalButtonOk: "project-creation-modal-button-ok",

  // Project Settings Page selectors
  projectSettingInputName: "project-setting-input-name",
  projectSettingInputAlias: "project-setting-input-alias",
  projectSettingTextareaDescription: "project-setting-textarea-description",
  projectSettingButtonSave: "project-setting-button-save",
  projectSettingUpdateButtonSave: "project-setting-update-button-save",
  projectSettingRoleOwner: "role-owner",
  projectSettingOwnerSwitch: "owner-switch",
  projectSettingExpectedName: "project name",
  projectSettingExpectedDescription: "project description",
  // Project List Page selectors
  projectListButtonNewProject: "project-list-button-new-project",

  // Project Settings Danger Zone selectors
  projectSettingsDangerZoneButtonDelete: "project-settings-danger-zone-button-delete",
  projectDeleteConfirmOk: "project-delete-confirm-ok",
  // Project Menu selectors
  projectMenu: "project-menu",
  projectSearchInput: "project-search-input",

  // III Model Overview selectors

  //  Model Overview selectors
  projectOverviewCreateModelButton: "project-overview-create-model-button",
  schemaFormModalButtonOk: "schema-form-modal-button-ok",
  schemaFormModalInputName: "schema-form-modal-input-name",
  schemaFormModalInputDescription: "schema-form-modal-input-description",
  schemaFormModalInputKey: "schema-form-modal-input-key",
  modelsListButtonAdd: "models-list-button-add",
  schemaDeletionModalButtonDelete: "schema-deletion-modal-button-delete",
  myIntegrationsSettingsDangerZoneButtonDelete:
    "my-integrations-settings-danger-zone-button-delete",

  // Workspace Label selectors
  workspaceLabel: (workspaceName: string) => `workspace-label-${workspaceName}`,

  // Project Menu selectors
  projectMenuHome: "home-menu-item",
  projectMenuOverview: "overview-menu-item",
  projectMenuSchema: "schema-menu-item",
  projectMenuContent: "content-menu-item",
  projectMenuUsers: "asset-menu-item",
  projectMenuRequest: "request-menu-item",
  projectMenuSettings: "settings-menu-item",
  projectMenuAccessibility: "accessibility-menu-item",

  // Accessibility selectors
  accessibilitySwitch: "accessibility-switch",
  accessibilitySaveChangesButton: "accessibility-save-changes-button",
  accessibilityPublicScopeSelect: "public-scope-select",
  accessibilityModelSwitch: (modelId: string) => `model-switch-${modelId}`,
  accessibilityScopeOption: (scope: string) => `scope-option-${scope.toLowerCase()}`,

  // Add these to your Selectors object:
  publicSwitch: "public-switch",
  searchButton: "search-button",
  clearSearchButton: "clear-search-button",
  projectNameText: "project-name-text",
  projectDescriptionText: "project-description-text",
  modelTitle: "model-title",
  modelKeyText: "model-key-text",
  modelMenuItem: "model-menu-item",
  cardDelete: (index: number) => `card-delete-${index}`,
  cardEdit: (index: number) => `card-edit-${index}`,
};
