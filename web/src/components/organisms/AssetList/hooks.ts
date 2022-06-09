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

export default (teamId?: string) => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [assetList, setAssetList] = useState<AssetNode[]>([]);

  const [createAssetMutation] = useCreateAssetMutation();
  const createAsset = useCallback(
    (file: UploadFile) => {
      (async () => {
        if (!teamId) return;
        await createAssetMutation({ variables: { teamId, file } });
      })();

      const asset: AssetNode = {
        id: String(assetList.length + 1),
        key: assetList.length + 1,
        file: file.name,
        unzipFile: "",
        mimeType: file.type,
        contentType: file.type ?? "",
        size: file.size ?? 0,
        createdBy: user?.nickname ?? "",
        createdAt: new Date(),
        teamId: "",
        name: file.name,
        url: "",
      };

      setAssetList((prevAssetList) => {
        return [...prevAssetList, asset];
      });
    },
    [teamId, assetList.length, user?.nickname, createAssetMutation]
  );

  const { data } = useGetAssetsQuery({
    variables: {
      teamId: teamId ?? "",
    },
  });

  useEffect(() => {
    const assets = (data?.assets.nodes as AssetNode[]) ?? [];
    setAssetList(assets);
  }, [data?.assets.nodes]);

  return {
    user,
    assetList,
    createAsset,
    navigate,
  };
};
