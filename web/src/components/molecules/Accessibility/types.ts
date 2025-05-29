export type PublicScope = "PRIVATE" | "LIMITED" | "PUBLIC";
export type FormType = {
  scope: PublicScope;
  alias: string;
  assetPublic: boolean;
  models: Record<string, boolean>;
};

export type ModelDataType = {
  key: string;
  name: string;
  id: string | string[];
  endpoint: string;
};

export type APIKeyType = {
  name: string;
  key: string;
};
