import AssetBody from "@reearth-cms/components/molecules/AssetList/AssetListBody";
import AssetListHeader from "@reearth-cms/components/molecules/AssetList/AssetListHeader";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { columns } from "@reearth-cms/components/organisms/AssetList/columns";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import { GetComponentProps } from "rc-table/lib/interface";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const { assetList, createAsset, navigate } = useHooks();

  const handleUpload = (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status !== "uploading") {
      createAsset(info.file);
    }

    if (info.file.status === "done") {
      console.log(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      console.log(`${info.file.name} file upload failed.`);
    }
  };

  const handleRowEvents: GetComponentProps<Asset> = (
    record: Asset,
    _rowIndex: number | undefined
  ) => {
    return {
      onDoubleClick: (_event: any) => {
        navigate(`/asset/${record.id}`);
      },
    };
  };

  return (
    <>
      <AssetListHeader
        title="Asset"
        subTitle="This is a subtitle"
        handleUpload={handleUpload}
      />
      <AssetBody
        fileList={assetList}
        columns={columns}
        onRow={handleRowEvents}
      />
    </>
  );
};

export default AssetList;
