import styled from "@emotion/styled";
import React from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import { FieldType } from "./types";

export interface Props {
  className?: string;
  addField: (fieldType: FieldType) => void;
}

type FieldListItem = { title: string; fields: string[] };

const data: FieldListItem[] = [
  {
    title: "Text",
    fields: ["Text", "TextArea", "MarkdownText"],
  },
  {
    title: "Asset",
    fields: ["Asset"],
  },
  {
    title: "Select",
    fields: ["Select"],
  },
  {
    title: "Number",
    fields: ["Integer"],
  },
  {
    title: "URL",
    fields: ["URL"],
  },
];

const FieldList: React.FC<Props> = ({ addField }) => {
  const t = useT();
  return (
    <>
      <h1>{t("Add Field")}</h1>
      <FieldStyledList
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <>
            <FieldCategoryTitle>{(item as FieldListItem).title}</FieldCategoryTitle>
            {(item as FieldListItem).fields?.map((field: string) => (
              <List.Item key={field} onClick={() => addField(field as FieldType)}>
                <List.Item.Meta
                  avatar={<Icon icon={fieldTypes[field].icon} color={fieldTypes[field].color} />}
                  title={fieldTypes[field].title}
                  description={fieldTypes[field].description}
                />
              </List.Item>
            ))}
          </>
        )}
      />
    </>
  );
};

const FieldCategoryTitle = styled.h2`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  margin-bottom: 12px;
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const FieldStyledList = styled(List)`
  .ant-list-item {
    background-color: #fff;
    cursor: pointer;
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

export default FieldList;
