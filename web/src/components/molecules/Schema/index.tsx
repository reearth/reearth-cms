import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Tabs, { TabsProps } from "@reearth-cms/components/atoms/Tabs";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import {
  Field,
  FieldType,
  Group,
  Tab,
  SelectedSchemaType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  data?: Model | Group;
  collapsed: boolean;
  selectedSchemaType: SelectedSchemaType;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onModalOpen: () => void;
  onDeletionModalOpen: () => void;
  modelsMenu: JSX.Element;
  setIsMeta: (isMeta: boolean) => void;
  onCollapse: (collapse: boolean) => void;
  onFieldReorder: (data: Field[]) => Promise<void>;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: FieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
};

const Schema: React.FC<Props> = ({
  data,
  collapsed,
  selectedSchemaType,
  hasCreateRight,
  hasUpdateRight,
  hasDeleteRight,
  onModalOpen,
  onDeletionModalOpen,
  modelsMenu,
  setIsMeta,
  onCollapse,
  onFieldReorder,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
}) => {
  const t = useT();
  const [tab, setTab] = useState<Tab>("fields");

  const dropdownItems = useMemo(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        icon: <StyledIcon icon="edit" />,
        onClick: onModalOpen,
        disabled: !hasUpdateRight,
      },
      {
        key: "delete",
        label: t("Delete"),
        icon: <StyledIcon icon="delete" />,
        onClick: onDeletionModalOpen,
        danger: true,
        disabled: !hasDeleteRight,
      },
    ],
    [hasDeleteRight, hasUpdateRight, onDeletionModalOpen, onModalOpen, t],
  );

  const DropdownMenu = useCallback(
    () => (
      <Dropdown key="more" menu={{ items: dropdownItems }} placement="bottomRight">
        <Button type="text" icon={<Icon icon="more" size={20} />} />
      </Dropdown>
    ),
    [dropdownItems],
  );

  const items: TabsProps["items"] = [
    {
      key: "fields",
      label: t("Fields"),
      children: (
        <div>
          <ModelFieldList
            fields={data?.schema.fields}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
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
            fields={data && "metadataSchema" in data ? data?.metadataSchema?.fields : undefined}
            hasUpdateRight={hasUpdateRight}
            hasDeleteRight={hasDeleteRight}
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
          {data && (
            <>
              <PageHeader
                title={data.name}
                subTitle={`#${data.key}`}
                style={{ backgroundColor: "#fff" }}
                extra={[<DropdownMenu key="more" />]}
              />
              {selectedSchemaType === "model" && (
                <StyledTabs activeKey={tab} items={items} onChange={handleTabChange} />
              )}
              {selectedSchemaType === "group" && (
                <GroupFieldsWrapper>
                  <ModelFieldList
                    fields={data?.schema?.fields}
                    hasUpdateRight={hasUpdateRight}
                    hasDeleteRight={hasDeleteRight}
                    handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
                    onFieldReorder={onFieldReorder}
                    onFieldDelete={onFieldDelete}
                  />
                </GroupFieldsWrapper>
              )}
            </>
          )}
        </Content>
      }
      right={
        <FieldListWrapper>
          <FieldList
            currentTab={tab}
            selectedSchemaType={selectedSchemaType}
            hasCreateRight={hasCreateRight}
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
  background: #fafafa;
`;

const FieldListWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px 12px 0;
`;

const StyledTabs = styled(Tabs)`
  max-height: calc(100% - 72px);
  .ant-tabs-nav {
    padding: 0 24px;
    margin-bottom: 12px;
    background: #fff;
  }
  .ant-tabs-content-holder {
    overflow-y: auto;
    padding: 0 24px 24px;
  }
`;

const GroupFieldsWrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 24px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 12px;
`;
