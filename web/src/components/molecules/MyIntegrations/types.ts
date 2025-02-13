export type Integration = {
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
};

export type IntegrationInfo = Pick<Integration, "name" | "description" | "logoUrl">;

export type Developer = {
  id: string;
  name: string;
  email: string;
};

export enum IntegrationType {
  Private = "Private",
  Public = "Public",
}

export type Webhook = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  secret: string;
  trigger: WebhookTrigger;
};

export type NewWebhook = Omit<Webhook, "id">;

export type WebhookTrigger = {
  onItemCreate?: boolean | null;
  onItemUpdate?: boolean | null;
  onItemDelete?: boolean | null;
  onItemPublish?: boolean | null;
  onItemUnPublish?: boolean | null;
  onAssetUpload?: boolean | null;
  onAssetDecompress?: boolean | null;
  onAssetDelete?: boolean | null;
};

export type WebhookValues = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  secret: string;
  trigger: string[];
};
