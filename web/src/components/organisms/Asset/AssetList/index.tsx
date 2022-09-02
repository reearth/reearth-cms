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
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import AssetListHeader from "@reearth-cms/components/molecules/Asset/AssetList/AssetListHeader";
import AssetListTable from "@reearth-cms/components/molecules/Asset/AssetList/AssetListTable";
import { uuidToURL } from "@reearth-cms/utils/convert";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";
import { dateSort, numberSort, stringSort } from "@reearth-cms/utils/sort";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const { workspaceId, projectId } = useParams();
  const {
    assetList,
    createAssets,
    assetsPerPage,
    navigate,
    handleSearchTerm,
    selection,
    setSelection,
    fileList,
    setFileList,
    uploading,
    setUploading,
    uploadModalVisibility,
    setUploadModalVisibility,
  } = useHooks(projectId);

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
          handleSearchTerm(value);
        } else {
          handleSearchTerm();
        }
      },
    },
  };

  const handleEdit = (asset: Asset) => {
    navigate(`/workspaces/${workspaceId}/${projectId}/asset/${asset.id}`);
  };

  const pagination: TablePaginationConfig = {
    pageSize: assetsPerPage,
    onChange: _page => console.log("implement me"),
    showSizeChanger: false,
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
      dataIndex: "fileName",
      key: "fileName",
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
      title: "Preview Type",
      dataIndex: "previewType",
      key: "previewType",
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
      dataIndex: "createdById",
      key: "createdById",
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
          url={uuidToURL(asset?.uuid, asset?.fileName)}
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
        dataSource={assetList}
        columns={columns}
        search={false}
        rowKey="id"
        options={options}
        pagination={pagination}
        toolbar={handleToolbarEvents}
        rowSelection={rowSelection}
      />
    </>
  );
};

export default AssetList;
