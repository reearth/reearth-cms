import styled from "@emotion/styled";
import React, { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import { useT } from "@reearth-cms/i18n";
import { Test } from "@reearth-cms/test/utils";

import { fieldTypes } from "./fieldTypes";
import { SchemaFieldType, SelectedSchemaType, Tab } from "./types";

type Props = {
  addField: (fieldType: SchemaFieldType) => void;
  currentTab: Tab;
  hasCreateRight: boolean;
  selectedSchemaType: SelectedSchemaType;
};

type FieldListItem = {
  fields: SchemaFieldType[];
  title: string;
};

const FieldList: React.FC<Props> = ({
  addField,
  currentTab,
  hasCreateRight,
  selectedSchemaType,
}) => {
  const t = useT();

  const common: FieldListItem[] = useMemo(
    () => [
      {
        fields: ["Text", "TextArea", "MarkdownText"],
        title: t("Text"),
      },
      {
        fields: ["Asset"],
        title: t("Asset"),
      },
      {
        fields: ["Date"],
        title: t("Time"),
      },
      {
        fields: ["Bool"],
        title: t("Boolean"),
      },
      {
        fields: ["Select"],
        title: t("Select"),
      },
      {
        fields: ["Integer", "Number"],
        title: t("Number"),
      },
      {
        fields: ["URL"],
        title: t("URL"),
      },
    ],
    [t],
  );

  const geometry: FieldListItem = useMemo(
    () => ({
      fields: ["GeometryObject", "GeometryEditor"],
      title: t("GeoJSON Geometry"),
    }),
    [t],
  );

  const group: FieldListItem[] = useMemo(() => [...common, geometry], [common, geometry]);

  const data: FieldListItem[] = useMemo(
    () => [
      ...common,
      {
        fields: ["Reference"],
        title: t("Relation"),
      },
      {
        fields: ["Group"],
        title: t("Group"),
      },
      geometry,
    ],
    [common, geometry, t],
  );

  const meta: FieldListItem[] = useMemo(
    () => [
      {
        fields: ["Tag", "Bool", "Checkbox", "Date", "Text", "URL"],
        title: t("Meta Data"),
      },
    ],
    [t],
  );

  const dataSource = useMemo(
    () => (selectedSchemaType === "group" ? group : currentTab === "meta-data" ? meta : data),
    [selectedSchemaType, group, currentTab, meta, data],
  );

  return (
    <>
      <StyledTitle>{t("Add Field")}</StyledTitle>
      <FieldStyledList
        dataSource={dataSource}
        hasCreateRight={hasCreateRight}
        itemLayout="horizontal"
        renderItem={item => (
          <>
            <FieldCategoryTitle>{item.title}</FieldCategoryTitle>
            {item.fields.map(field => (
              <List.Item
                data-testid={Test.getDataTestIdFromSchemaFieldType(field)}
                key={field}
                onClick={hasCreateRight ? () => addField(field) : undefined}>
                <Meta
                  avatar={<Icon color={fieldTypes[field].color} icon={fieldTypes[field].icon} />}
                  description={t(fieldTypes[field].description)}
                  title={t(fieldTypes[field].title)}
                />
              </List.Item>
            ))}
          </>
        )}
      />
    </>
  );
};

const StyledTitle = styled.h1`
  font-size: 16px;
`;

const FieldCategoryTitle = styled.h2`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 12px;
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const FieldStyledList = styled(List<FieldListItem>)<{ hasCreateRight: boolean }>`
  max-height: calc(100% - 34px);
  overflow-y: auto;
  padding-bottom: 24px;
  .ant-list-item {
    background-color: #fff;
    cursor: ${({ hasCreateRight }) => (hasCreateRight ? "pointer" : "not-allowed")};
    + .ant-list-item {
      margin-top: 12px;
    }
    padding: 4px;
    box-shadow: 0px 2px 8px #00000026;
    .ant-list-item-meta {
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
      .ant-list-item-meta-avatar {
        border: 1px solid #f0f0f0;
        width: 28px;
        height: 28px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
`;

const Meta = styled(List.Item.Meta)`
  .ant-list-item-meta-description {
    font-size: 12px !important;
  }
`;

export default FieldList;
