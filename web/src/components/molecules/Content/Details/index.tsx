import { Dispatch, SetStateAction } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import { ItemField } from "@reearth-cms/components/molecules/Content/types";
import ContentWrapper from "@reearth-cms/components/molecules/Content/Wrapper";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  model?: Model;
  modelsMenu: React.ReactNode;
  initialFormValues: { [key: string]: any };
  itemId?: string;
  loading: boolean;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  createAssets: (files: UploadFile[]) => Promise<void>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  model,
  modelsMenu: ModelsMenu,
  initialFormValues,
  itemId,
  loading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  onItemCreate,
  onItemUpdate,
  onBack,
  createAssets,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploading,
  setUploadModalVisibility,
}) => {
  return (
    <ContentWrapper modelsMenu={ModelsMenu}>
      <ContentForm
        loading={loading}
        itemId={itemId}
        model={model}
        initialFormValues={initialFormValues}
        assetList={assetList}
        fileList={fileList}
        loadingAssets={loadingAssets}
        uploading={uploading}
        uploadModalVisibility={uploadModalVisibility}
        onBack={onBack}
        onItemCreate={onItemCreate}
        onItemUpdate={onItemUpdate}
        createAssets={createAssets}
        onAssetsReload={onAssetsReload}
        onAssetSearchTerm={onAssetSearchTerm}
        setFileList={setFileList}
        setUploading={setUploading}
        setUploadModalVisibility={setUploadModalVisibility}
      />
    </ContentWrapper>
  );
};

export default ContentDetailsMolecule;
