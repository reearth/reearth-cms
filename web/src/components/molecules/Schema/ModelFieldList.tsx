import styled from "@emotion/styled";
import React from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";

export interface Props {
  className?: string;
}

const data = [
  {
    title: "Ant Design Title 1",
  },
];

const ModelFieldList: React.FC<Props> = () => {
  const { Meta } = Card;
  return (
    <>
      <h1>Add Field</h1>
      <FieldStyledList
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <>
            <List.Item extra={<Icon icon="more" style={{ fontSize: "22px" }} />}>
              <List.Item.Meta
                avatar={
                  <FieldThumbnail>
                    <StyledIcon icon="textT" color="red" /> <h3>Text</h3>
                  </FieldThumbnail>
                }
                title={"Text"}
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
      }
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
      .ant-list-item-meta-avatar {
      }
    }
  }
`;

export default ModelFieldList;
