import { useAuth } from "@reearth-cms/auth";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";

import {
  useGetAssetsQuery,
  useCreateAssetMutation,
  Maybe,
  User,
  Project,
  AssetFile,
} from "@reearth-cms/gql/graphql-client-api";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export type AssetNode = NonNullable<Asset>;
export type AssetUser = Maybe<User>;

export default (projectId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<AssetNode[]>([]);
  const [filteredAssetList, setFilteredAssetList] = useState<AssetNode[]>([]);
  const [selection, setSelection] = useState({
    selectedRowKeys: [],
  });
  const [createAssetMutation] = useCreateAssetMutation();
  const createAsset = useCallback(
    (file: UploadFile) => {
      (async () => {
        if (!projectId) return;
        await createAssetMutation({ variables: { projectId, file } });
      })();

      // TODO: these values are hardcoded, should be replaced with actual values
      const asset: Asset = {
        id: String(assetList.length + 1),
        size: file.size ?? 0,
        createdBy: user as AssetUser,
        createdById: "",
        createdAt: new Date(),
        project: {} as Project,
        projectId: "",
        fileName: file.name,
        file: {} as AssetFile,
        hash: "",
        commentsCount: 0,
      };

      setAssetList((prevAssetList) => {
        return [...prevAssetList, asset];
      });
      setFilteredAssetList((prevFilteredAssetList) => {
        return [...prevFilteredAssetList, asset];
      });
    },
    [assetList.length, user, projectId, createAssetMutation]
  );

  const { data } = useGetAssetsQuery({
    variables: {
      projectId: projectId ?? "",
    },
  });

  useEffect(() => {
    const assets = (data?.assets.nodes as AssetNode[]) ?? [];
    setAssetList(assets);
  }, [data?.assets.nodes]);

  return {
    user,
    assetList,
    filteredAssetList,
    setFilteredAssetList,
    createAsset,
    navigate,
    selection,
    setSelection,
  };
};
