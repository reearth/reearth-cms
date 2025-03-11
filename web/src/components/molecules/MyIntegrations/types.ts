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

export type TriggerKey =
  | "onItemCreate"
  | "onItemUpdate"
  | "onItemDelete"
  | "onItemPublish"
  | "onItemUnPublish"
  | "onAssetUpload"
  | "onAssetDecompress"
  | "onAssetDelete";

export type WebhookTrigger = { [key in TriggerKey]?: boolean | null };

export type WebhookValues = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  secret: string;
  trigger: TriggerKey[];
};
