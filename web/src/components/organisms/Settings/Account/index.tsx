import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Input from "@reearth-cms/components/atoms/Input";
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
    <>
      <PaddedDiv>
        <h1>Hello {me?.name}</h1>
      </PaddedDiv>
      <PaddedDiv>
        <Button type="primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </PaddedDiv>
      <PaddedDiv>
        <Input
          style={{ maxWidth: "300px" }}
          value={filterText}
          onChange={handleInputChange}
          type="text"
        />
        <Button onClick={handleClick}>Update name</Button>
      </PaddedDiv>
    </>
  );
};

const PaddedDiv = styled.div`
  padding: 24px 50px;
`;

export default Account;
