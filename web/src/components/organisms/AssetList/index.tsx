import { EditOutlined, MessageOutlined } from "@ant-design/icons";
import { ListToolBarProps } from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-table";
import { OptionConfig } from "@ant-design/pro-table/lib/components/ToolBar";
import { TableRowSelection } from "@ant-design/pro-table/lib/typing";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import AssetListHeader from "@reearth-cms/components/molecules/AssetList/AssetListHeader";
import AssetListTable from "@reearth-cms/components/molecules/AssetList/AssetListTable";
import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";
import { dateSort, numberSort, stringSort } from "@reearth-cms/utils/sort";
import enUSIntl from "antd/lib/locale/en_US";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const {
    assetList,
    createAsset,
    navigate,
    filteredAssetList,
    setFilteredAssetList,
    selection,
    setSelection,
  } = useHooks();

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

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: (value: string) => {
        if (value) {
          const filteredData = assetList.filter((node) =>
            node?.name.includes(value)
          );
          setFilteredAssetList(filteredData);
        } else {
          setFilteredAssetList(assetList);
        }
      },
    },
  };

  const handleEdit = (asset: Asset) => {
    navigate(`/asset/${asset.id}`);
  };

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(asset)}
        ></Button>
      ),
    },
    {
      title: () => <MessageOutlined />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, asset) => <CustomTag value={asset.commentsCount} />,
    },
    {
      title: "File",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => stringSort(a.name, b.name),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      sorter: (a, b) => numberSort(a.size, b.size),
      render: (_text, record) => bytesFormat(record.size),
    },
    {
      title: "Content Type",
      dataIndex: "contentType",
      key: "contentType",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dateSort(a.createdAt, b.createdAt),
      render: (_text, record) => dateTimeFormat(record.createdAt),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Action",
      render: (_, asset) => (
        <DownloadButton
          type="link"
          filename={asset.name}
          url={asset.url}
          displayDefaultIcon={false}
        ></DownloadButton>
      ),
    },
  ];

  const options: OptionConfig = {
    search: true,
  };

  const rowSelection: TableRowSelection = {
    selectedRowKeys: selection.selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelection({
        ...selection,
        selectedRowKeys: selectedRowKeys,
      });
    },
  };

  return (
    <>
      <AssetListHeader
        title="Asset"
        subTitle="This is a subtitle"
        handleUpload={handleUpload}
      />
      <AssetListTable
        providerLocale={enUSIntl}
        dataSource={filteredAssetList}
        columns={columns}
        search={false}
        rowKey="id"
        options={options}
        toolbar={handleToolbarEvents}
        rowSelection={rowSelection}
      />
    </>
  );
};

export default AssetList;
