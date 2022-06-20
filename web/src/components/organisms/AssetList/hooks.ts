import { useAuth0 } from "@auth0/auth0-react";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { UploadFile } from "antd/lib/upload/interface";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export type AssetNode = NonNullable<Asset>;

export default (workspaceId?: string) => {
  const { user } = useAuth0();
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
        if (!workspaceId) return;
        await createAssetMutation({ variables: { workspaceId, file } });
      })();

      // TODO: these values are hardcoded, should be replaced with actual values
      const asset: AssetNode = {
        id: String(assetList.length + 1),
        unzipFile: "",
        contentType: file.type ?? "",
        size: file.size ?? 0,
        createdBy: user?.nickname ?? "",
        createdAt: new Date(),
        workspaceId: "",
        name: file.name,
        url: "",
        commentsCount: 0,
      };

      setAssetList((prevAssetList) => {
        return [...prevAssetList, asset];
      });
      setFilteredAssetList((prevFilteredAssetList) => {
        return [...prevFilteredAssetList, asset];
      });
    },
    [workspaceId, assetList.length, user?.nickname, createAssetMutation]
  );

  const { data } = useGetAssetsQuery({
    variables: {
      workspaceId: workspaceId ?? "",
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
