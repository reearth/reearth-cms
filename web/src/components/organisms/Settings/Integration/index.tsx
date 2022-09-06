import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ConfigProvider from "@reearth-cms/components/atoms/ConfigProvider";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Search from "@reearth-cms/components/atoms/Search";
import Table from "@reearth-cms/components/atoms/Table";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    filters: [],
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Creator",
    dataIndex: "creator",
    key: "creator",
  },
  {
    title: "State",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
  },
];

const Integration: React.FC = () => {
  const dataSource: [] = [];

  return (
    <>
      <PaddedContent>
        <MemberPageHeader
          title="Integration"
          extra={
            <Button type="primary" onClick={() => {}} icon={<Icon icon="userGroupAdd" />}>
              New Member
            </Button>
          }></MemberPageHeader>
        <ActionHeader>
          <Search placeholder="input search text" allowClear style={{ width: 264 }} />
        </ActionHeader>
        <ConfigProvider
          renderEmpty={() => (
            <EmptyTableWrapper>
              <Title>No Integration yet</Title>
              <Suggestion>
                Create a new{" "}
                <Button onClick={() => {}} type="primary" icon={<Icon icon="plus" />}>
                  Connect Integration
                </Button>
              </Suggestion>
              <Suggestion>
                Or read <a href="">how to use Re:Earth CMS</a> first
              </Suggestion>
            </EmptyTableWrapper>
          )}>
          <Table dataSource={dataSource} columns={columns} style={{ padding: "24px" }} />;
        </ConfigProvider>
      </PaddedContent>
    </>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
`;

const ActionHeader = styled(Content)`
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const MemberPageHeader = styled(PageHeader)`
  border-bottom: 1px solid #f0f0f0;
`;

const EmptyTableWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 64px;
`;

const Suggestion = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000;
`;

export default Integration;
