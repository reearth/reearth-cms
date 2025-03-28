import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";

import LocalTab from "./localTab";
import UrlTab from "./UrlTab";
import { checkIfCompressedFile } from "./util";

const { TabPane } = Tabs;

type Props = {
  isOpen: boolean;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  modalClose: () => void;
  onLink?: (assetId: string) => void;
};

type FormValues = {
  file: {
    fileList: UploadFile[];
  };
  url: string;
  autoUnzip?: boolean;
};

const initialValues: FormValues = {
  file: {
    fileList: [],
  },
  url: "",
  autoUnzip: true,
};

const UploadModal: React.FC<Props> = ({
  isOpen,
  onAssetsCreate,
  onAssetCreateFromUrl,
  modalClose,
  onLink,
}) => {
  const t = useT();
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [isCompressedFile, setIsCompressedFile] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [form] = Form.useForm<FormValues>();

  const handleValuesChange = useCallback(() => {
    const { url, file } = form.getFieldsValue();
    if (uploadType === "local") {
      setIsDisabled(file.fileList.length === 0);
    } else {
      setIsDisabled(!url);
      setIsCompressedFile(checkIfCompressedFile(url));
    }
  }, [form, uploadType]);

  const handleTabChange = useCallback(
    (key: string) => {
      if (key === "local" || key === "url") {
        setUploadType(key);
        const { url, file } = form.getFieldsValue();
        if (key === "local") {
          setIsDisabled(file.fileList.length === 0);
        } else {
          setIsDisabled(!url);
        }
      }
    },
    [form],
  );

  const handleCancel = useCallback(() => {
    modalClose();
    setUploadType("local");
    setIsDisabled(true);
    setIsCompressedFile(false);
    form.resetFields();
  }, [form, modalClose]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    try {
      const { file, url, autoUnzip } = form.getFieldsValue();
      let asset;
      if (uploadType === "url") {
        asset = await onAssetCreateFromUrl(url, !!autoUnzip);
      } else {
        const assets = await onAssetsCreate(file.fileList);
        asset = assets[0];
      }
      if (onLink && asset) {
        onLink(asset.id);
      }
      handleCancel();
    } finally {
      setUploading(false);
    }
  }, [uploadType, onLink, handleCancel, form, onAssetCreateFromUrl, onAssetsCreate]);

  return (
    <Modal
      centered
      open={isOpen}
      onCancel={handleCancel}
      closable={!uploading}
      maskClosable={!uploading}
      footer={
        <>
          <Button type="default" disabled={uploading} onClick={handleCancel}>
            {t("Cancel")}
          </Button>
          <Button type="primary" onClick={handleUpload} disabled={isDisabled} loading={uploading}>
            {uploading ? t("Uploading") : onLink ? t("Upload and Link") : t("Upload")}
          </Button>
        </>
      }
      width="50vw"
      styles={{
        body: {
          minHeight: "50vh",
        },
      }}>
      <div>
        <h2>{t("Asset Uploader")}</h2>
      </div>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onValuesChange={handleValuesChange}>
        <Tabs activeKey={uploadType} onChange={handleTabChange}>
          <TabPane tab={t("Local")} key="local">
            <LocalTab isWithLink={!!onLink} />
          </TabPane>
          <TabPane tab={t("URL")} key="url">
            <UrlTab isCompressedFile={isCompressedFile} />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default UploadModal;
