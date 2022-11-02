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
  onItemCreate: (data: { schemaId: string; fields: ItemField[] }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  initialFormValues: { [key: string]: any };
  onBack: (modelId?: string) => void;
  itemId?: string;
  loading: boolean;
  assetList: Asset[];
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  loadingAssets: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  fileList: UploadFile[];
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
  uploading: boolean;
  uploadModalVisibility: boolean;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  model,
  modelsMenu: ModelsMenu,
  onItemCreate,
  onItemUpdate,
  initialFormValues,
  onBack,
  itemId,
  loading,
  assetList,
  onAssetSearchTerm,
  onAssetsReload,
  loadingAssets,
  createAssets,
  fileList,
  setFileList,
  setUploading,
  setUploadModalVisibility,
  uploading,
  uploadModalVisibility,
}) => {
  return (
    <ContentWrapper modelsMenu={ModelsMenu}>
      <ContentForm
        loading={loading}
        onBack={onBack}
        itemId={itemId}
        onItemCreate={onItemCreate}
        onItemUpdate={onItemUpdate}
        model={model}
        initialFormValues={initialFormValues}
        assetList={assetList}
        onAssetSearchTerm={onAssetSearchTerm}
        onAssetsReload={onAssetsReload}
        loadingAssets={loadingAssets}
        createAssets={createAssets}
        fileList={fileList}
        setFileList={setFileList}
        setUploading={setUploading}
        setUploadModalVisibility={setUploadModalVisibility}
        uploading={uploading}
        uploadModalVisibility={uploadModalVisibility}
      />
    </ContentWrapper>
  );
};

export default ContentDetailsMolecule;
