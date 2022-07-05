import { PlusOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Greeting from "@reearth-cms/components/molecules/Dashboard/Greeting";
import Search from "antd/lib/input/Search";
import { Content } from "antd/lib/layout/layout";

const Project: React.FC = () => {
  return (
    <>
      <PaddedContent>
        <Greeting></Greeting>
        <ActionHeader>
          <Search
            placeholder="input search text"
            allowClear
            style={{ width: 264 }}
          />
          <ButtonWrapper>
            {/* <Button onClick={handleModalOpen}>Create a Workspace</Button> */}
            <Button type="primary" icon={<PlusOutlined />}>
              Search
            </Button>
          </ButtonWrapper>
        </ActionHeader>
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

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

export default Project;
