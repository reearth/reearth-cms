import { useState, useCallback, useMemo } from "react";

import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { convertAsset } from "@reearth-cms/components/organisms/Asset/convertAsset";
import { useGetAssetQuery, Asset as GQLAsset } from "@reearth-cms/gql/graphql-client-api";

export default (
  fileList: UploadFile[],
  uploadUrl: string,
  uploadType: UploadType,
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>,
  onAssetCreateFromUrl: (url: string) => Promise<Asset | undefined>,
  setUploadModalVisibility: (visible: boolean) => void,
  onChange?: (value: string) => void,
  value?: string,
) => {
  const [visible, setVisible] = useState(false);
  const handleClick = useCallback(() => {
    setVisible(true);
  }, [setVisible]);

  const handleLinkAssetModalCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const displayUploadModal = useCallback(() => {
    setUploadModalVisibility(true);
  }, [setUploadModalVisibility]);

  const handleAssetUpload = useCallback(async () => {
    if (uploadType === "url") {
      return (await onAssetCreateFromUrl(uploadUrl)) ?? undefined;
    } else {
      const assets = await onAssetsCreate(fileList);
      return assets?.length > 0 ? assets[0] : undefined;
    }
  }, [fileList, onAssetCreateFromUrl, onAssetsCreate, uploadType, uploadUrl]);

  const handleUploadAndLink = useCallback(async () => {
    const asset = await handleAssetUpload();
    if (asset) onChange?.(asset.id);
  }, [handleAssetUpload, onChange]);

  const { data: rawAsset } = useGetAssetQuery({
    variables: {
      assetId: value ?? "",
      withFiles: true,
    },
    skip: !value,
  });

  const asset: Asset | undefined = useMemo(() => {
    return convertAsset(rawAsset?.asset as GQLAsset);
  }, [rawAsset]);

  return {
    visible,
    asset,
    handleClick,
    handleLinkAssetModalCancel,
    displayUploadModal,
    handleUploadAndLink,
  };
};
