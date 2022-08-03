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

const FieldList: React.FC<Props> = () => {
  const { Meta } = Card;
  return (
    <>
      <h1>Add Field</h1>
      <FieldStyledList
        itemLayout="horizontal"
        dataSource={data}
        renderItem={item => (
          <>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="textT" color="red" />}
                title={"Text"}
                description={"Heading and titles, one-line field"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="textT" color="red" />}
                title={"TextArea"}
                description={"Multi line text"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="markDown" color="red" />}
                title={"Markdown text"}
                description={"Rich text which supports md style"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="asset" color="red" />}
                title={"Asset"}
                description={"Description"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="listBullets" color="red" />}
                title={"Option"}
                description={"Description"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="numberNine" color="red" />}
                title={"Int"}
                description={"Description"}
              />
            </List.Item>
            <List.Item>
              <List.Item.Meta
                avatar={<Icon icon="link" color="red" />}
                title={"URL"}
                description={"Description"}
              />
            </List.Item>
          </>
        )}
      />
    </>
  );
};

const FieldStyledList = styled(List)`
  .ant-list-item {
    background-color: #fff;
    cursor: pointer;
    + .ant-list-item {
      margin-top: 12px;
    }
    padding: 4px;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
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
