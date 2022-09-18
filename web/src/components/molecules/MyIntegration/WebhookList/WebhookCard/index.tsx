import { Switch } from "antd";
import React from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";

export interface Props {
  title: string;
  url: string;
}

const WebhookCard: React.FC<Props> = ({ title, url }) => {
  return (
    <Card
      style={{ marginTop: 16 }}
      title={
        <>
          {title} <Switch checkedChildren="ON" unCheckedChildren="OFF" defaultChecked />
        </>
      }
      extra={
        <>
          <Icon icon="settings" onClick={() => {}} />
          <Icon icon="delete" onClick={() => {}} />
        </>
      }>
      {{ url }}
    </Card>
  );
};

export default WebhookCard;
