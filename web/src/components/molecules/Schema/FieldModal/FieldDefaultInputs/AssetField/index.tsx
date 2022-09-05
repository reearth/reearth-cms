import Upload from "antd/lib/upload/Upload";
import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";

const AssetField: React.FC = () => {
  return (
    <Form.Item name="defaultValue" label="Set default value">
      <Upload action="/upload.do" listType="picture-card">
        <div>
          <Icon icon="link" />
          <div style={{ marginTop: 8 }}>Asset</div>
        </div>
      </Upload>
    </Form.Item>
  );
};

export default AssetField;
