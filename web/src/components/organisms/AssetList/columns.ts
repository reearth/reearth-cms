import { Asset } from "@reearth-cms/components/organisms/AssetList/asset.type";
import type { ColumnsType } from "antd/lib/table";
import moment from "moment";

export const columns: ColumnsType<Asset> = [
  {
    title: "File",
    dataIndex: "file",
    key: "file",
    sorter: (a, b) => (a.name > b.name ? 1 : -1),
  },
  {
    title: "Unzip File",
    dataIndex: "unzipFile",
    key: "unzipFile",
  },
  {
    title: "Mime Type",
    dataIndex: "contentType",
    key: "contentType",
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
    sorter: (a, b) => a.size - b.size,
    render: (size) => `${(size / 1024).toFixed(2)}kb`,
  },
  {
    title: "Created By",
    dataIndex: "createdBy",
    key: "createdBy",
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    key: "createdAt",
    sorter: (a, b) => moment(a.createdAt).diff(moment(b.createdAt)),
    render: (createAt) => `${moment(createAt).format("YYYY-MM-DD hh:mm")}`,
  },
];
