import styled from "@emotion/styled";
import { Dispatch, Key, SetStateAction } from "react";

import Modal from "@reearth-cms/components/atoms/Modal";
import { UploadFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import { useT } from "@reearth-cms/i18n";

import AssetListTable from "../../Asset/AssetListTable";

type Props = {
  // modal props
  visible: boolean;
  handleCancel: () => void;
  // table props
  assetList: Asset[];
  assetsPerPage: number | undefined;
  onEdit: (asset: Asset) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  onSearchTerm: (term?: string) => void;
  setSelection: Dispatch<
    SetStateAction<{
      selectedRowKeys: Key[];
    }>
  >;
  onAssetsReload: () => void;
  loading: boolean;
  // upload asset props
  fileList: UploadFile<File>[];
  uploading: boolean;
  uploadProps: UploadProps;
  uploadModalVisibility: boolean;
  displayUploadModal: () => void;
  hideUploadModal: () => void;
  handleUpload: () => void;
};

const LinkToAssetModal: React.FC<Props> = ({
  visible,
  handleCancel,
  fileList,
  uploading,
  uploadProps,
  uploadModalVisibility,
  displayUploadModal,
  hideUploadModal,
  handleUpload,
  assetList,
  assetsPerPage,
  onEdit,
  selection,
  onSearchTerm,
  setSelection,
  onAssetsReload,
  loading,
}) => {
  const t = useT();

  return (
    <Modal
      centered
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width="50vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        paddingBottom: "80px",
      }}>
      <Header>
        <h2>{t("Link To Asset")}</h2>
      </Header>
      <Body className="body">
        <AssetListTable
          assetList={assetList}
          assetsPerPage={assetsPerPage}
          onEdit={onEdit}
          onSearchTerm={onSearchTerm}
          selection={selection}
          setSelection={setSelection}
          onAssetsReload={onAssetsReload}
          loading={loading}
        />
      </Body>
      <Footer>
        <UploadAsset
          fileList={fileList}
          uploading={uploading}
          uploadProps={uploadProps}
          uploadModalVisibility={uploadModalVisibility}
          displayUploadModal={displayUploadModal}
          hideUploadModal={hideUploadModal}
          handleUpload={handleUpload}
        />
      </Footer>
    </Modal>
  );
};

const Header = styled.div``;

const Body = styled.div``;

const Footer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px;
`;

export default LinkToAssetModal;
