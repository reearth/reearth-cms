import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { useT } from "@reearth-cms/i18n";

import AssetItem from "../../Form/AssetItem";
import { moveItemInArray } from "../moveItemArray";

type Props = {
  className?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: string;
  uploadType: UploadType;
  onUploadModalCancel: () => void;
  setUploadUrl: (url: string) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
};

const MultiValueAsset: React.FC<Props> = ({
  className,
  value = [],
  onChange,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
}) => {
  const t = useT();
  const handleInput = (e: string, id: number) => {
    onChange?.(value?.map((valueItem, index) => (index === id ? e : valueItem)));
  };

  const deleteInput = (key: number) => {
    onChange?.(
      value.filter((_, index) => {
        return index !== key;
      }),
    );
  };

  return (
    <div className={className}>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            <FieldButton
              type="link"
              icon={<Icon icon="arrowUp" />}
              onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
              disabled={key === 0}
            />
            <FieldButton
              type="link"
              icon={<Icon icon="arrowDown" />}
              onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
              disabled={key === value.length - 1}
            />
            <AssetItem
              value={valueItem}
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadUrl={uploadUrl}
              uploadType={uploadType}
              onUploadModalCancel={onUploadModalCancel}
              setUploadUrl={setUploadUrl}
              setUploadType={setUploadType}
              onAssetsCreate={onAssetsCreate}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetsReload={onAssetsReload}
              onAssetSearchTerm={onAssetSearchTerm}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              onChange={(e: string) => handleInput(e, key)}
            />
            <FieldButton
              type="link"
              icon={<Icon icon="delete" />}
              onClick={() => deleteInput(key)}
            />
          </FieldWrapper>
        ))}
      <Button
        icon={<Icon icon="plus" />}
        type="primary"
        onClick={() => {
          if (!value) value = [];
          onChange?.([...value, ""]);
        }}>
        {t("New")}
      </Button>
    </div>
  );
};

export default MultiValueAsset;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const FieldButton = styled(Button)`
  color: #000000d9;
  margin-top: 4px;
`;
