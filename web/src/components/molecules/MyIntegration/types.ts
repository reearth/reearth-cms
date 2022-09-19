export type Integration = {
  id: string;
  name: string;
  description: string | null | undefined;
  logoUrl: string;
  developerId: string;
  iType: IntegrationType;
};

export enum IntegrationType {
  Private = "Private",
  Public = "Public",
}
