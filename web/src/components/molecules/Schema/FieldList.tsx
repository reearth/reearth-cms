import styled from "@emotion/styled";
import React, { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import PopConfirm from "@reearth-cms/components/atoms/PopConfirm";
import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { fieldTypes } from "./fieldTypes";
import type { SchemaFieldType, SelectedSchemaType, Tab } from "./types";

type Props = {
  currentTab: Tab;
  selectedSchemaType: SelectedSchemaType;
  hasCreateRight: boolean;
  addField: (fieldType: SchemaFieldType) => void;
};

type FieldListItem = {
  title: string;
  fields: SchemaFieldType[];
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

  const geometry = useMemo<FieldListItem>(
    () => ({
      title: t("GeoJSON Geometry"),
      fields: ["Geometry", "GeometryObject", "GeometryEditor"],
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
            {item.fields.map(field => {
              const { replacedBy } = fieldTypes[field];
              const listItem = (
                <List.Item
                  key={field}
                  onClick={hasCreateRight && !replacedBy ? () => addField(field) : undefined}
                  data-testid={Test.getDataTestIdFromSchemaFieldType(field)}>
                  <Meta
                    avatar={<Icon icon={fieldTypes[field].icon} color={fieldTypes[field].color} />}
                    title={
                      <>
                        {t(fieldTypes[field].title)}
                        {fieldTypes[field].isNew && (
                          <FieldTag color="green" bordered={false}>
                            {t("New", { context: "badge" })}
                          </FieldTag>
                        )}
                        {replacedBy && (
                          <FieldTag color="orange" bordered={false}>
                            {t("Deprecated", { context: "badge" })}
                          </FieldTag>
                        )}
                      </>
                    }
                    description={t(fieldTypes[field].description)}
                  />
                </List.Item>
              );
              if (!replacedBy) return listItem;

              return (
                <PopConfirm
                  key={field}
                  disabled={!hasCreateRight}
                  title={t("{{field}} is deprecated", { field: t(fieldTypes[field].title) })}
                  description={
                    <PopConfirmDescription>
                      {t(
                        "Please use the new Geometry field instead. It supports drawing on a map, entering coordinates and GeoJSON in one place.",
                      )}
                    </PopConfirmDescription>
                  }
                  okText={t("Use Geometry")}
                  cancelText={t("Continue anyway")}
                  okButtonProps={{
                    "data-testid":
                      DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__UseReplacementButton,
                  }}
                  cancelButtonProps={{
                    "data-testid": DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__ContinueButton,
                  }}
                  onConfirm={() => addField(replacedBy)}
                  onCancel={() => addField(field)}>
                  {listItem}
                </PopConfirm>
              );
            })}
          </>
        )}
      />
    </>
  );
};

const FieldTag = styled(Tag)`
  margin-left: ${AntdToken.SPACING.XS}px;
  font-size: 11px;
  line-height: 18px;
`;

const PopConfirmDescription = styled.div`
  max-width: 280px;
`;

const StyledTitle = styled.h1`
  font-size: ${AntdToken.FONT.SIZE_LG}px;
`;

const FieldCategoryTitle = styled.h2`
  font-weight: ${AntdToken.FONT_WEIGHT.NORMAL};
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  line-height: ${AntdToken.LINE_HEIGHT.SM}px;
  margin-bottom: ${AntdToken.SPACING.SM}px;
  margin-top: ${AntdToken.SPACING.SM}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const FieldStyledList = styled(List<FieldListItem>)<{ hasCreateRight: boolean }>`
  max-height: calc(100% - 34px);
  overflow-y: auto;
  padding-bottom: ${AntdToken.SPACING.LG}px;
  .ant-list-item {
    background-color: ${AntdColor.NEUTRAL.BG_WHITE};
    cursor: ${({ hasCreateRight }) => (hasCreateRight ? "pointer" : "not-allowed")};
    + .ant-list-item {
      margin-top: ${AntdToken.SPACING.SM}px;
    }
    padding: ${AntdToken.SPACING.XXS}px;
    box-shadow: 0px 2px 8px ${AntdColor.NEUTRAL.FILL};
    .ant-list-item-meta {
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
      .ant-list-item-meta-avatar {
        border: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
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
    font-size: ${AntdToken.FONT.SIZE_SM}px !important;
  }
`;

export default FieldList;
