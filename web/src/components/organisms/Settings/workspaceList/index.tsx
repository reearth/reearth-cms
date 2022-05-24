import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import List from "@reearth-cms/components/atoms/List";
import { Content } from "antd/lib/layout/layout";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHooks from "../Workspace/hooks";

type Props = {
  workspaceId: string;
};

const WorkspaceList: React.FC<Props> = ({ workspaceId }) => {
  const { workspaces, createWorkspace, selectWorkspace } = useHooks({
    workspaceId,
  });
  const navigate = useNavigate();
  const [workspaceName, setWorkspaceName] = useState("");

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWorkspaceName?.(e.currentTarget.value);
    },
    [setWorkspaceName]
  );

  const handleAddWorkspace = useCallback(() => {
    if (!workspaceName) return;
    createWorkspace({ name: workspaceName });
    setWorkspaceName("");
  }, [setWorkspaceName, workspaceName, createWorkspace]);

  return (
    <>
      <PaddedContent>
        <Form style={{ maxWidth: "300px" }}>
          <Form.Item
            label="Workspace name"
            rules={[{ required: true, message: "Please input Workspace name" }]}
          >
            <Input
              min={8}
              max={12}
              value={workspaceName}
              onChange={handleNameChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleAddWorkspace}
            >
              Add new workspace
            </Button>
          </Form.Item>
        </Form>
      </PaddedContent>
      <PaddedContent>
        <h1>User Workspaces</h1>
        <List
          itemLayout="horizontal"
          dataSource={workspaces}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<a onClick={() => selectWorkspace(item)}>{item.name}</a>}
                description={
                  "Members: " +
                  item.members.map((member) => member.user?.name).join(",")
                }
              />
            </List.Item>
          )}
        />

        <Button type="primary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </PaddedContent>
    </>
  );
};

const PaddedContent = styled(Content)`
  padding: 24px 50px;
  background: #fff;
`;

export default WorkspaceList;
