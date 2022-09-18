import { Switch } from "antd";
import React from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";

export interface Props {
  title: string;
}

const WebhookCard: React.FC<Props> = ({ title }) => {
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
      https://reearth.io/itemchanged
    </Card>
  );
};

export default WebhookCard;
