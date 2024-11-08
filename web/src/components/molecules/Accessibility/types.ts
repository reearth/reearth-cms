export type PublicScope = "PRIVATE" | "LIMITED" | "PUBLIC";
export type FormType = {
  scope: PublicScope;
  alias: string;
  assetPublic: boolean;
  models: Record<string, boolean>;
};
