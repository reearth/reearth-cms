import { User } from "@reearth-cms/components/molecules/Member/types";

export type Integration = {
  config: {
    token?: string;
    webhooks?: Webhook[];
  };
  description?: null | string;
  developer: User;
  developerId: string;
  id: string;
  iType: IntegrationType;
  logoUrl: string;
  name: string;
};

export type IntegrationInfo = Pick<Integration, "description" | "logoUrl" | "name">;

export type IntegrationType = "Private" | "Public";

export type Webhook = {
  active: boolean;
  id: string;
  name: string;
  secret: string;
  trigger: WebhookTrigger;
  url: string;
};

export type NewWebhook = Omit<Webhook, "id">;

export type TriggerKey =
  | "onAssetDecompress"
  | "onAssetDelete"
  | "onAssetUpload"
  | "onItemCreate"
  | "onItemDelete"
  | "onItemPublish"
  | "onItemUnPublish"
  | "onItemUpdate";

export type WebhookTrigger = Partial<Record<TriggerKey, boolean | null>>;

export type WebhookValues = {
  trigger: TriggerKey[];
} & Webhook;
