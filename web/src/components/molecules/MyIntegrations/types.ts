export interface Integration {
  id: string;
  name: string;
  description?: string | null;
  logoUrl: string;
  developerId: string;
  developer: Developer;
  iType: IntegrationType;
  config: {
    token?: string;
    webhooks?: Webhook[];
  };
}

export interface Developer {
  id: string;
  name: string;
  email: string;
}

export enum IntegrationType {
  Private = "Private",
  Public = "Public",
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  active: boolean;
  secret: string;
  trigger: WebhookTrigger;
}

export interface WebhookTrigger {
  onItemCreate?: boolean | null;
  onItemUpdate?: boolean | null;
  onItemDelete?: boolean | null;
  onItemPublish?: boolean | null;
  onItemUnPublish?: boolean | null;
  onAssetUpload?: boolean | null;
  onAssetDecompress?: boolean | null;
  onAssetDelete?: boolean | null;
}

export interface WebhookValues {
  id: string;
  name: string;
  url: string;
  active: boolean;
  secret: string;
  trigger: string[];
}
