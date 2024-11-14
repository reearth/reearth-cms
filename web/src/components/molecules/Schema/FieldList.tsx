import styled from "@emotion/styled";
import React, { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { FieldType, Tab, SelectedSchemaType } from "./types";

type Props = {
  currentTab: Tab;
  selectedSchemaType: SelectedSchemaType;
  hasCreateRight: boolean;
  addField: (fieldType: FieldType) => void;
};

type FieldListItem = {
  title: string;
  fields: FieldType[];
};

const FieldList: React.FC<Props> = ({
  currentTab,
  selectedSchemaType,
  hasCreateRight,
  addField,
}) => {
  const t = useT();

  const common: FieldListItem[] = useMemo(
    () => [
      {
        title: t("Text"),
        fields: ["Text", "TextArea", "MarkdownText"],
      },
      {
        title: t("Asset"),
        fields: ["Asset"],
      },
      {
        title: t("Time"),
        fields: ["Date"],
      },
      {
        title: t("Boolean"),
        fields: ["Bool"],
      },
      {
        title: t("Select"),
        fields: ["Select"],
      },
      {
        title: t("Number"),
        fields: ["Integer", "Number"],
      },
      {
        title: t("URL"),
        fields: ["URL"],
      },
    ],
    [t],
  );

  const geometry: FieldListItem = useMemo(
    () => ({
      title: t("GeoJSON Geometry"),
      fields: ["GeometryObject", "GeometryEditor"],
    }),
    [t],
  );

  const group: FieldListItem[] = useMemo(() => [...common, geometry], [common, geometry]);

  const data: FieldListItem[] = useMemo(
    () => [
      ...common,
      {
        title: t("Relation"),
        fields: ["Reference"],
      },
      {
        title: t("Group"),
        fields: ["Group"],
      },
      geometry,
    ],
    [common, geometry, t],
  );

  const meta: FieldListItem[] = useMemo(
    () => [
      {
        title: t("Meta Data"),
        fields: ["Tag", "Bool", "Checkbox", "Date", "Text", "URL"],
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
        itemLayout="horizontal"
        dataSource={dataSource}
        hasCreateRight={hasCreateRight}
        renderItem={item => (
          <>
            <FieldCategoryTitle>{item.title}</FieldCategoryTitle>
            {item.fields.map(field => (
              <List.Item key={field} onClick={hasCreateRight ? () => addField(field) : undefined}>
                <Meta
                  avatar={<Icon icon={fieldTypes[field].icon} color={fieldTypes[field].color} />}
                  title={t(fieldTypes[field].title)}
                  description={t(fieldTypes[field].description)}
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
