export type PublicScope = "PRIVATE" | "PUBLIC"; // Add "limited" when functionality becomes available

export type FormType = {
  scope?: PublicScope;
  alias?: string;
  assetPublic?: boolean;
  models?: Record<string, boolean>;
};
