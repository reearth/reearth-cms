import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import { UploadProps } from "@reearth-cms/components/atoms/Upload";
import AssetListHeader from "@reearth-cms/components/molecules/Asset/AssetList/AssetListHeader";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetList/AssetListTable";
import { Asset } from "@reearth-cms/gql/graphql-client-api";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";
import { dateSort, numberSort, stringSort } from "@reearth-cms/utils/sort";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const { workspaceId, projectId } = useParams();
  const createdById = "mockId";
  const {
    assetList,
    createAssets,
    navigate,
    filteredAssetList,
    setFilteredAssetList,
    selection,
    setSelection,
    fileList,
    setFileList,
    uploading,
    setUploading,
    uploadModalVisibility,
    setUploadModalVisibility,
  } = useHooks(projectId, createdById);

  const displayUploadModal = () => {
    setUploadModalVisibility(true);
  };
  const hideUploadModal = () => {
    setUploadModalVisibility(false);
  };

  const handleUpload = () => {
    setUploading(true);
    createAssets(fileList)
      .then(() => {
        setFileList([]);
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        setUploading(false);
        hideUploadModal();
      });
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: true,
    directory: false,
    showUploadList: true,
    accept: "image/*,.zip,.json,.geojson,.topojson,.shapefile,.kml,.czml,.glb",
    listType: "picture",
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (_file, files) => {
      setFileList([...fileList, ...files]);
      return false;
    },
    fileList,
  };

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: (value: string) => {
        if (value) {
          const filteredData = assetList.filter(node => node?.fileName.includes(value));
          setFilteredAssetList(filteredData);
        } else {
          setFilteredAssetList(assetList);
        }
      },
    },
  };

  const handleEdit = (asset: Asset) => {
    navigate(`/workspaces/${workspaceId}/${projectId}/assets/${asset.id}`);
  };

  const columns: ProColumns<Asset>[] = [
    {
      title: "",
      render: (_, asset) => (
        <Button type="link" icon={<Icon icon="edit" />} onClick={() => handleEdit(asset)}></Button>
      ),
    },
    {
      title: () => <Icon icon="message" />,
      dataIndex: "commentsCount",
      key: "commentsCount",
      render: (_, _asset) => <CustomTag value={0} />,
    },
    {
      title: "File",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => stringSort(a.fileName, b.fileName),
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
          filename={asset.fileName}
          url={asset.hash}
          displayDefaultIcon={false}></DownloadButton>
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
        fileList={fileList}
        uploading={uploading}
        uploadModalVisibility={uploadModalVisibility}
        displayUploadModal={displayUploadModal}
        hideUploadModal={hideUploadModal}
        uploadProps={uploadProps}
        handleUpload={handleUpload}
      />
      <AssetListTable
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
