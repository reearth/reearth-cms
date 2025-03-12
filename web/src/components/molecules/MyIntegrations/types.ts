import { User } from "@reearth-cms/components/molecules/Member/types";

export type Integration = {
  id: string;
  name: string;
  description?: string | null;
  logoUrl: string;
  developerId: string;
  developer: User;
  iType: IntegrationType;
  config: {
    token?: string;
    webhooks?: Webhook[];
  };
};

export type IntegrationInfo = Pick<Integration, "name" | "description" | "logoUrl">;

export type IntegrationType = "Private" | "Public";

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

export type WebhookValues = Webhook & {
  trigger: TriggerKey[];
};
