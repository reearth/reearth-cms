import { ExclamationCircleOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Typography from "@reearth-cms/components/atoms/Typography";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/projectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import TextArea from "antd/lib/input/TextArea";
import Layout, { Header, Content } from "antd/lib/layout/layout";
import Sider from "antd/lib/layout/Sider";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useDashboardHooks from "../../Dashboard/hooks";

import useHooks from "./hooks";

export interface FormValues {
  name: string;
  description: string;
}

const ProjectSettings: React.FC = () => {
  const { confirm } = Modal;
  const [form] = Form.useForm();
  const { projectId, workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  const {
    user,
    personalWorkspace,
    currentWorkspace,
    workspaces,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    workspaceModalShown,
    handleWorkspaceCreate,
  } = useDashboardHooks(workspaceId);

  const { project, handleProjectUpdate, handleProjectDelete } = useHooks({
    projectId,
  });

  useEffect(() => {
    form.setFieldsValue({
      name: project?.name,
      description: project?.description,
    });
  }, [form, project]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async (values) => {
        handleProjectUpdate({
          name: values.name,
          description: values.description,
        });
        form.resetFields();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }, [form, handleProjectUpdate]);

  const handleProjectDeleteConfirmation = useCallback(() => {
    confirm({
      title: "Are you sure you want to delete this project?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        handleProjectDelete();
      },
      onCancel() {},
    });
  }, [confirm, handleProjectDelete]);

  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Header>
          <MoleculeHeader
            handleModalOpen={handleWorkspaceModalOpen}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            user={user}
          />
        </Header>
        <Layout>
          <ProjectSider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={{ backgroundColor: "#fff" }}
          >
            <ProjectMenu
              defaultSelectedKeys={["settings"]}
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            />
          </ProjectSider>
          <PaddedContent>
            <ProjectSection> {project?.name} </ProjectSection>
            <ProjectSection>
              <Form
                style={{ maxWidth: 400 }}
                form={form}
                layout="vertical"
                autoComplete="off"
              >
                <Form.Item name="name" label="Name">
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  extra="Write something here to describe this record."
                >
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button
                    onClick={handleSubmit}
                    type="primary"
                    htmlType="submit"
                  >
                    Save changes
                  </Button>
                </Form.Item>
              </Form>
            </ProjectSection>
            <ProjectSection>
              <Typography style={{ marginBottom: 16 }}>Danger Zone</Typography>
              <Button
                onClick={handleProjectDeleteConfirmation}
                type="primary"
                danger
              >
                Delete project
              </Button>
            </ProjectSection>
          </PaddedContent>
        </Layout>
      </Layout>
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
`;

const ProjectSider = styled(Sider)`
  background-color: #fff;
  .ant-layout-sider-trigger {
    background-color: #fff;
    color: #002140;
    text-align: left;
    padding: 0 24px;
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const ProjectSection = styled.div`
  background-color: #fff;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: rgba(0, 0, 0, 0.85);
  padding: 22px 24px;
  margin-bottom: 16px;
`;

export default ProjectSettings;
