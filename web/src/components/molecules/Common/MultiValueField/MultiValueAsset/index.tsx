import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";

import AssetItem from "../../Form/AssetItem";
import { moveItemInArray } from "../moveItemArray";

type Props = {
  itemAssets?: ItemAsset[];
  value?: string[];
  onChange?: (value: string[]) => void;
  assetList?: Asset[];
  fileList?: UploadFile[];
  loadingAssets?: boolean;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadUrl?: { url: string; autoUnzip: boolean };
  uploadType?: UploadType;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  disabled?: boolean;
  onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
  onUploadModalCancel?: () => void;
  setUploadUrl?: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType?: (type: UploadType) => void;
  onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet?: () => void;
  onAssetsReload?: () => void;
  onAssetSearchTerm?: (term?: string | undefined) => void;
  setFileList?: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility?: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
};

const MultiValueAsset: React.FC<Props> = ({
  itemAssets,
  value = [],
  onChange,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  disabled,
  onGetAsset,
}) => {
  const t = useT();
  const handleInput = useCallback(
    (e: string, id: number) => {
      onChange?.(value?.map((valueItem, index) => (index === id ? e : valueItem)));
    },
    [onChange, value],
  );

  useEffect(() => {
    if (typeof value === "string") onChange?.([value]);
    else if (!value) onChange?.([]);
  }, [onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_, index) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => (
          <FieldWrapper key={key}>
            {!disabled && (
              <>
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
              </>
            )}
            <AssetItem
              itemAssets={itemAssets}
              disabled={disabled}
              value={valueItem}
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadUrl={uploadUrl}
              uploadType={uploadType}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onAssetTableChange={onAssetTableChange}
              onUploadModalCancel={onUploadModalCancel}
              setUploadUrl={setUploadUrl}
              setUploadType={setUploadType}
              onAssetsCreate={onAssetsCreate}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetsGet={onAssetsGet}
              onAssetsReload={onAssetsReload}
              onAssetSearchTerm={onAssetSearchTerm}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              onChange={(e: string) => handleInput(e, key)}
              onGetAsset={onGetAsset}
            />
            {!disabled && (
              <FieldButton
                type="link"
                icon={<Icon icon="delete" />}
                onClick={() => handleInputDelete(key)}
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          type="primary"
          onClick={() => {
            if (!value) value = [];
            onChange?.([...value, ""]);
          }}>
          {t("New")}
        </Button>
      )}
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
