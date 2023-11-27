import styled from "@emotion/styled";
import { useState } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Upload, { UploadProps, RcFile } from "@reearth-cms/components/atoms/Upload";
import { useT } from "@reearth-cms/i18n";

const AvatarUploader: React.FC = () => {
  const t = useT();
  const [imageUrl, setImageUrl] = useState<string>();

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList }) => {
    const img = fileList[fileList.length - 1].originFileObj;
    if (img) {
      getBase64(img, url => {
        setImageUrl(url);
      });
    }
  };

  return (
    <Container>
      <Form.Item label={t("Your Avatar")} name="avatar">
        <Upload
          listType="picture-card"
          showUploadList={false}
          beforeUpload={() => false}
          onChange={handleChange}>
          {imageUrl ? (
            <StyledImg src={imageUrl} alt="avatar" />
          ) : (
            <div>
              <Icon icon="plus" size={14} />
              <div style={{ marginTop: 8 }}>{t("Upload")}</div>
            </div>
          )}
        </Upload>
      </Form.Item>
    </Container>
  );
};

export default AvatarUploader;

const Container = styled.div`
  border-left: 1px solid #d9d9d9;
  padding-left: 32px;
  margin-left: 32px;
`;

const StyledImg = styled.img`
  width: 100%;
`;
