import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import { Input, Layout } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHooks from "./hooks";

export type Props = {};

const Account: React.FC<Props> = () => {
  const { me, updateName } = useHooks();
  const navigate = useNavigate();

  const [filterText, setFilterText] = useState("");
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilterText?.(e.currentTarget.value);
    },
    [setFilterText]
  );

  const handleClick = useCallback(() => {
    updateName(filterText);
  }, [filterText, updateName]);

  return (
    <Layout>
      <LightHeader>Hello {me?.name}</LightHeader>
      <Layout>
        <PaddedContent>
          <PaddedDiv>
            <Button type="primary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </PaddedDiv>
          <Input
            style={{ maxWidth: "300px" }}
            value={filterText}
            onChange={handleInputChange}
            type="text"
          />
          <Button onClick={handleClick}>Update name</Button>
        </PaddedContent>
      </Layout>
    </Layout>
  );
};

const PaddedDiv = styled.div`
  padding: 24px 0;
`;

const LightHeader = styled(Header)`
  background-color: #add8e6;
  font-weight: 800;
  font-size: 26px;
`;

const PaddedContent = styled(Content)`
  min-height: 280px;
  padding: 24px 50px;
  background: #fff;
`;

export default Account;
