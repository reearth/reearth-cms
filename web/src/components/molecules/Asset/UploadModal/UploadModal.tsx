import styled from "@emotion/styled";
import { useCallback } from "react";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import LocalTab from "./localTab";
import UrlTab from "./UrlTab";

const { TabPane } = Tabs;

type Props = {
  alertList?: AlertProps[];
  alsoLink?: boolean;
  fileList?: UploadFile<File>[];
  onCancel?: () => void;
  onUpload: () => void;
  onUploadModalClose?: () => void;
  setUploadType?: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  uploading?: boolean;
  uploadProps: UploadProps;
  uploadType?: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
  visible?: boolean;
};

const UploadModal: React.FC<Props> = ({
  alertList,
  alsoLink,
  fileList,
  onCancel,
  onUpload,
  onUploadModalClose,
  setUploadType,
  setUploadUrl,
  uploading,
  uploadProps,
  uploadType,
  uploadUrl,
  visible,
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
      afterClose={onUploadModalClose}
      centered
      closable={!uploading}
      footer={
        <>
          <Button disabled={uploading} onClick={onCancel} type="default">
            {t("Cancel")}
          </Button>
          <Button
            disabled={fileList?.length === 0 && !uploadUrl.url}
            loading={uploading}
            onClick={onUpload}
            type="primary">
            {uploading ? t("Uploading") : alsoLink ? t("Upload and Link") : t("Upload")}
          </Button>
        </>
      }
      maskClosable={!uploading}
      onCancel={onCancel}
      open={visible}
      styles={{
        body: {
          minHeight: "50vh",
        },
      }}
      width="50vw">
      <div>
        <h2>{t("Asset Uploader")}</h2>
      </div>
      <Tabs activeKey={uploadType} onChange={handleTabChange}>
        <TabPane key="local" tab={t("Local")}>
          <LocalTab alertList={alertList} uploadProps={uploadProps} />
        </TabPane>
        <TabPane key="url" tab={t("URL")}>
          <UrlTab setUploadUrl={setUploadUrl} uploadUrl={uploadUrl} />
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
