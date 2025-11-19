import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import LocalTab from "./localTab";
import UrlTab from "./UrlTab";

const { TabPane } = Tabs;

type Props = {
  alsoLink?: boolean;
  visible?: boolean;
  uploadProps: UploadProps;
  fileList?: UploadFile<File>[];
  uploading?: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType?: UploadType;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType?: (type: UploadType) => void;
  onUploadModalClose?: () => void;
  onUpload: () => void;
  onCancel?: () => void;
};

const UploadModal: React.FC<Props> = ({
  alsoLink,
  visible,
  uploadProps,
  uploading,
  fileList,
  uploadUrl,
  uploadType,
  setUploadUrl,
  setUploadType,
  onUploadModalClose,
  onUpload,
  onCancel,
}) => {
  const t = useT();

  const handleTabChange = useCallback(
    (key: string) => {
      setUploadType?.(key as UploadType);
    },
    [setUploadType],
  );

  return (
    <StyledModal
      centered
      open={visible}
      onCancel={onCancel}
      closable={!uploading}
      maskClosable={!uploading}
      footer={
        <>
          <Button type="default" disabled={uploading} onClick={onCancel}>
            {t("Cancel")}
          </Button>
          <Button
            type="primary"
            onClick={onUpload}
            disabled={fileList?.length === 0 && !uploadUrl.url}
            loading={uploading}>
            {uploading ? t("Uploading") : alsoLink ? t("Upload and Link") : t("Upload")}
          </Button>
        </>
      }
      width="50vw"
      afterClose={onUploadModalClose}
      styles={{
        body: {
          minHeight: "50vh",
        },
      }}>
      <div>
        <h2>{t("Asset Uploader")}</h2>
      </div>
      <Tabs activeKey={uploadType} onChange={handleTabChange}>
        <TabPane tab={t("Local")} key="local">
          <LocalTab uploadProps={uploadProps} />
        </TabPane>
        <TabPane tab={t("URL")} key="url">
          <UrlTab uploadUrl={uploadUrl} setUploadUrl={setUploadUrl} />
        </TabPane>
      </Tabs>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .ant-upload-span {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
`;

export default UploadModal;
