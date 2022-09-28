import { Switch } from "antd";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";

import { Webhook } from "../../types";

export type Props = {
  webhook: Webhook;
};

const WebhookCard: React.FC<Props> = ({ webhook }) => {
  return (
    <Card
      style={{ marginTop: 16 }}
      title={
        <>
          {webhook.name} <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
        </>
      }
      extra={
        <>
          <Icon icon="settings" onClick={() => {}} />
          <Icon icon="delete" onClick={() => {}} />
        </>
      }>
      {webhook.url}
    </Card>
  );
};

export default WebhookCard;
