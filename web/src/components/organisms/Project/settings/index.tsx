import styled from "@emotion/styled";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Form from "@reearth-cms/components/atoms/Form";
import Header from "@reearth-cms/components/atoms/Header";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Layout from "@reearth-cms/components/atoms/Layout";
import Modal from "@reearth-cms/components/atoms/Modal";
import Sider from "@reearth-cms/components/atoms/Sider";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import Typography from "@reearth-cms/components/atoms/Typography";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/projectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import { useT } from "@reearth-cms/i18n";

import useDashboardHooks from "../../Dashboard/hooks";

import useHooks from "./hooks";

export interface FormValues {
  name: string;
  description: string;
}

const ProjectSettings: React.FC = () => {
  const t = useT();
  const { confirm } = Modal;
  const [form] = Form.useForm();
  const { projectId, workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const { Title } = Typography;

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
      .then(async values => {
        handleProjectUpdate({
          name: values.name,
          description: values.description,
        });
        form.resetFields();
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, handleProjectUpdate]);

  const handleProjectDeleteConfirmation = useCallback(() => {
    confirm({
      title: t("Are you sure you want to delete this project?"),
      icon: <Icon icon="exclamationCircle" />,
      onOk() {
        handleProjectDelete();
      },
    });
  }, [confirm, handleProjectDelete, t]);

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
            onCollapse={value => setCollapsed(value)}
            style={{ backgroundColor: "#fff" }}>
            <ProjectMenu
              projectId={projectId}
              defaultSelectedKeys={["settings"]}
              inlineCollapsed={collapsed}
              workspaceId={currentWorkspace?.id}
            />
          </ProjectSider>
          <PaddedContent>
            <ProjectSection> {project?.name} </ProjectSection>
            <ProjectSection>
              <Form style={{ maxWidth: 400 }} form={form} layout="vertical" autoComplete="off">
                <Form.Item name="name" label={t("Name")}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={t("Description")}
                  extra={t("Write something here to describe this record.")}>
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item>
                  <Button onClick={handleSubmit} type="primary" htmlType="submit">
                    {t("Save changes")}
                  </Button>
                </Form.Item>
              </Form>
            </ProjectSection>
            <ProjectSection>
              <Title level={4}>{t("Danger Zone")}</Title>
              <Button onClick={handleProjectDeleteConfirmation} type="primary" danger>
                {t("Delete project")}
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
