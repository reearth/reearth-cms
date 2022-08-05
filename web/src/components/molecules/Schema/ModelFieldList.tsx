import styled from "@emotion/styled";
import React from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import { fieldTypes } from "@reearth-cms/components/organisms/Project/Schema/fieldTypes";

import { Field } from "../Dashboard/types";

export interface Props {
  className?: string;
  fields?: Field[];
}

const ModelFieldList: React.FC<Props> = ({ fields }) => {
  return (
    <>
      <FieldStyledList
        itemLayout="horizontal"
        dataSource={fields}
        renderItem={item => (
          <>
            <List.Item extra={<Icon icon="more" style={{ fontSize: "22px" }} />}>
              <List.Item.Meta
                avatar={
                  <FieldThumbnail>
                    <StyledIcon
                      icon={fieldTypes[item?.type].icon}
                      color={fieldTypes[item?.type].color}
                    />
                    <h3>{item?.type}</h3>
                  </FieldThumbnail>
                }
                title={`${item?.title}${item.required ? " *" : ""}`}
              />
            </List.Item>
          </>
        )}
      />
    </>
  );
};

const StyledIcon = styled(Icon)`
  border: 1px solid #f0f0f0;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.45);
  }
`;

const FieldStyledList = styled(List)`
  padding-top: 24px;
  .ant-list-item {
    background-color: #fff;
    cursor: pointer;
    + .ant-list-item {
      margin-top: 12px;
    }
    padding: 24px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    .ant-list-item-meta {
      .ant-list-item-meta-content {
        text-align: center;
        margin: auto;
      }
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
      .ant-list-item-meta-avatar {
        min-width: 130px;
      }
    }
  }
`;

export default ModelFieldList;
