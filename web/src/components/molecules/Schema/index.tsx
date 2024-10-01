import styled from "@emotion/styled";
import { useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs, { TabsProps } from "@reearth-cms/components/atoms/Tabs";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import { Field, FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  collapsed?: boolean;
  model?: Model;
  modelsMenu?: JSX.Element;
  onCollapse?: (collapse: boolean) => void;
  onFieldReorder: (data: Field[]) => Promise<void> | void;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: FieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
};

export type Tab = "fields" | "meta-data";

const Schema: React.FC<Props> = ({
  collapsed,
  model,
  modelsMenu,
  onCollapse,
  onFieldReorder,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
}) => {
  const t = useT();
  const [tab, setTab] = useState<Tab>("fields");

  const items: TabsProps["items"] = [
    {
      key: "fields",
      label: t("Fields"),
      children: (
        <div>
          <ModelFieldList
            fields={model?.schema.fields}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            onFieldReorder={onFieldReorder}
            onFieldDelete={onFieldDelete}
          />
        </div>
      ),
    },
    {
      key: "meta-data",
      label: t("Meta Data"),
      children: (
        <div>
          <ModelFieldList
            isMeta={true}
            fields={model?.metadataSchema?.fields}
            handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
            onFieldReorder={onFieldReorder}
            onFieldDelete={onFieldDelete}
          />
        </div>
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    setTab(key as Tab);
  };

  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        <Content>
          <PageHeader title={model?.name} subTitle={model?.key ? `#${model.key}` : null} />
          <StyledTabs activeKey={tab} items={items} onChange={handleTabChange} />
        </Content>
      }
      right={
        <FieldListWrapper>
          <FieldList currentTab={tab} addField={onFieldCreationModalOpen} />
        </FieldListWrapper>
      }
    />
  );
};

export default Schema;

const Content = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
`;

const FieldListWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px;
  overflow-y: auto;
`;

const StyledTabs = styled(Tabs)`
  padding: 24px;
`;
