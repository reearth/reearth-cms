export type ProjectVisibility = "PRIVATE" | "PUBLIC";

export type PublicationSettings = {
  publicAssets: boolean;
  publicModels: string[];
};

export type APIKey = {
  description: string;
  id: string;
  key: string;
  name: string;
  publication: PublicationSettings;
};

export type ProjectAccessibility = {
  apiKeys: APIKey[];
  publication: PublicationSettings;
  visibility: ProjectVisibility;
};

export type FormType = {
  assetPublic: boolean;
  models: Record<string, boolean>;
};

export type KeyFormType = {
  assetPublic: boolean;
  description: string;
  key: string;
  models: Record<string, boolean>;
  name: string;
};

export type ModelDataType = {
  endpoint: string;
  id: string | string[];
  key: string;
  name: string;
};

export type APIKeyModelType = {
  id: string;
  key: string;
  name: string;
};
