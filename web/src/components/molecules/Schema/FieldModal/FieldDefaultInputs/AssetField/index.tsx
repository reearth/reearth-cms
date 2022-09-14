import Upload from "antd/lib/upload/Upload";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

const AssetField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <Upload action="/upload.do" listType="picture-card">
        <div>
          <Icon icon="link" />
          <div style={{ marginTop: 8 }}>{t("Asset")}</div>
        </div>
      </Upload>
    </Form.Item>
  );
};

export default AssetField;
