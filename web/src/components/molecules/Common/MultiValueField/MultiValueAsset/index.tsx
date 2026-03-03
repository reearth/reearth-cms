import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { AssetProps } from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import { useT } from "@reearth-cms/i18n";

import AssetItem from "../../Form/AssetItem";
import { moveItemInArray } from "../moveItemArray";

type Props = {
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
} & AssetProps;

const MultiValueAsset: React.FC<Props> = ({
  assetList,
  disabled,
  fileList,
  itemAssets,
  loadingAssets,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onChange,
  onGetAsset,
  onUploadModalCancel,
  page,
  pageSize,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
  value = [],
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
                  color="default"
                  disabled={key === 0}
                  icon={<Icon icon="arrowUp" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key - 1))}
                  variant="link"
                />
                <FieldButton
                  color="default"
                  disabled={key === value.length - 1}
                  icon={<Icon icon="arrowDown" size={16} />}
                  onClick={() => onChange?.(moveItemInArray(value, key, key + 1))}
                  variant="link"
                />
              </>
            )}
            <AssetItem
              assetList={assetList}
              disabled={disabled}
              fileList={fileList}
              itemAssets={itemAssets}
              loadingAssets={loadingAssets}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetsCreate={onAssetsCreate}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsGet={onAssetsGet}
              onAssetsReload={onAssetsReload}
              onAssetTableChange={onAssetTableChange}
              onChange={(e: string) => handleInput(e, key)}
              onGetAsset={onGetAsset}
              onUploadModalCancel={onUploadModalCancel}
              page={page}
              pageSize={pageSize}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              setUploadType={setUploadType}
              setUploadUrl={setUploadUrl}
              totalCount={totalCount}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadType={uploadType}
              uploadUrl={uploadUrl}
              value={valueItem}
            />
            {!disabled && (
              <FieldButton
                color="default"
                icon={<Icon icon="delete" size={16} />}
                onClick={() => handleInputDelete(key)}
                variant="link"
              />
            )}
          </FieldWrapper>
        ))}
      {!disabled && (
        <Button
          icon={<Icon icon="plus" />}
          onClick={() => {
            if (!value) value = [];
            onChange?.([...value, ""]);
          }}
          type="primary">
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
