import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs, { TabsProps } from "@reearth-cms/components/atoms/Tabs";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import { Field, FieldType, Model, Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  collapsed?: boolean;
  model?: Model;
  group?: Group;
  onModelUpdateModalOpen: any;
  onModelDeletionModalOpen: any;
  onGroupUpdateModalOpen: any;
  onGroupDeletionModalOpen: any;
  modelsMenu?: JSX.Element;
  selectedSchemaType?: SelectedSchemaType;
  setIsMeta?: (isMeta: boolean) => void;
  onCollapse?: (collapse: boolean) => void;
  onFieldReorder: (data: Field[]) => Promise<void> | void;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: FieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
};

export type Tab = "fields" | "meta-data";
export type SelectedSchemaType = "model" | "group";

const Schema: React.FC<Props> = ({
  collapsed,
  model,
  group,
  onModelUpdateModalOpen,
  onModelDeletionModalOpen,
  onGroupUpdateModalOpen,
  onGroupDeletionModalOpen,
  modelsMenu,
  selectedSchemaType,
  setIsMeta,
  onCollapse,
  onFieldReorder,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
}) => {
  const t = useT();
  const [tab, setTab] = useState<Tab>("fields");

  const handleEdit = () => {
    selectedSchemaType === "model" ? onModelUpdateModalOpen?.() : onGroupUpdateModalOpen?.();
  };

  const handleDelete = () => {
    selectedSchemaType === "model" ? onModelDeletionModalOpen?.() : onGroupDeletionModalOpen?.();
  };

  const dropdownItems = [
    {
      key: "edit",
      label: t("Edit"),
      icon: <StyledIcon icon="edit" />,
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: t("Delete"),
      icon: <StyledIcon icon="delete" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  const DropdownMenu = () => (
    <Dropdown key="more" menu={{ items: dropdownItems }} placement="bottomRight">
      <Button type="text" icon={<Icon icon="more" size={20} />} />
    </Dropdown>
  );

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

  const handleTabChange = useCallback(
    (key: string) => {
      setTab(key as Tab);
      setIsMeta?.(key === "meta-data" && selectedSchemaType === "model");
    },
    [selectedSchemaType, setIsMeta],
  );

  const title = useMemo(
    () => (selectedSchemaType === "model" ? model?.name : group?.name),
    [group?.name, model?.name, selectedSchemaType],
  );

  const subTitle = useMemo(() => {
    if (selectedSchemaType === "model") {
      return model?.key ? `#${model.key}` : null;
    } else {
      return group?.key ? `#${group.key}` : null;
    }
  }, [group?.key, model?.key, selectedSchemaType]);

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
          <PageHeader title={title} subTitle={subTitle} extra={[<DropdownMenu key="more" />]} />
          {selectedSchemaType === "model" && (
            <StyledTabs activeKey={tab} items={items} onChange={handleTabChange} />
          )}
          {selectedSchemaType === "group" && (
            <GroupFieldsWrapper>
              <ModelFieldList
                fields={group?.schema?.fields}
                handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
                onFieldReorder={onFieldReorder}
                onFieldDelete={onFieldDelete}
              />
            </GroupFieldsWrapper>
          )}
        </Content>
      }
      right={
        <FieldListWrapper>
          <FieldList
            currentTab={tab}
            selectedSchemaType={selectedSchemaType}
            addField={onFieldCreationModalOpen}
          />
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

const GroupFieldsWrapper = styled.div`
  padding: 24px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 12px;
`;
