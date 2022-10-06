import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import ContentTable from "@reearth-cms/components/molecules/Content/ContentTable";
import { Item } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  contentTableFields?: any[];
  contentTableColumns?: ProColumns<Item>[];
  modelName?: string;
};

const ContentTableWrapper: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  modelName,
}) => (
  <>
    <PageHeader title={modelName} />
    <ContentTable
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
    />
  </>
);

export default ContentTableWrapper;
