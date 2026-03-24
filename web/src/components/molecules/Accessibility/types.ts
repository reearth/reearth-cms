export type ProjectVisibility = "PRIVATE" | "PUBLIC";

export type PublicationSettings = {
  publicModels: string[];
  publicAssets: boolean;
};

export type APIKey = {
  id: string;
  name: string;
  description: string;
  key: string;
  publication: PublicationSettings;
};

export type ProjectAccessibility = {
  visibility: ProjectVisibility;
  publication: PublicationSettings;
  apiKeys: APIKey[];
};

export type FormType = {
  assetPublic: boolean;
  models: Record<string, boolean>;
};

export type KeyFormType = {
  name: string;
  description: string;
  key: string;
  assetPublic: boolean;
  models: Record<string, boolean>;
};

export type ModelDataType = {
  key: string;
  name: string;
  id: string | string[];
  endpoint: string;
};

export type APIKeyModelType = {
  name: string;
  key: string;
  id: string;
};
