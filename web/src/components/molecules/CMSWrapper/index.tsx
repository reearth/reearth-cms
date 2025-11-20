import styled from "@emotion/styled";
import { motion } from "motion/react";
import { useRef } from "react";

import Content from "@reearth-cms/components/atoms/Content";
import Layout from "@reearth-cms/components/atoms/Layout";
import Sider from "@reearth-cms/components/atoms/Sider";

import ReloadModal from "../ReloadModal";
import Uploader from "../Uploader";
import { UploaderQueueItem, UploaderState } from "../Uploader/types";

export type InnerProps = {
  onWorkspaceModalOpen?: () => void;
};

export type Props = {
  headerComponent: React.ReactNode;
  contentComponent: React.ReactNode;
  sidebarComponent: React.ReactNode;
  collapsed: boolean;
  onCollapse: (collapse: boolean) => void;
  shouldPreventReload: boolean;
  isShowUploader: boolean;
  uploaderState: UploaderState;
  onUploaderOpen: (isOpen: boolean) => void;
  onRetry: (id: UploaderQueueItem["id"]) => void;
  onCancel: (id: UploaderQueueItem["id"]) => void;
  onCancelAll: () => void;
};

const CMSWrapper: React.FC<Props> = ({
  contentComponent,
  sidebarComponent,
  headerComponent,
  collapsed,
  onCollapse,
  shouldPreventReload,
  isShowUploader,
  uploaderState,
  onUploaderOpen,
  onRetry,
  onCancel,
  onCancelAll,
}) => {
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <DragConstraint ref={constraintsRef}>
      <Wrapper>
        <HeaderWrapper>{headerComponent}</HeaderWrapper>
        <BodyWrapper>
          <CMSSidebar collapsible collapsed={collapsed} onCollapse={onCollapse} collapsedWidth={54}>
            {sidebarComponent}
          </CMSSidebar>
          <ContentWrapper>{contentComponent}</ContentWrapper>
        </BodyWrapper>

        {isShowUploader && (
          <Uploader
            constraintsRef={constraintsRef}
            onUploaderOpen={onUploaderOpen}
            onRetry={onRetry}
            onCancel={onCancel}
            onCancelAll={onCancelAll}
            uploaderState={uploaderState}
          />
        )}

        <ReloadModal shouldPreventReload={shouldPreventReload}></ReloadModal>
      </Wrapper>
    </DragConstraint>
  );
};

const Wrapper = styled(Layout)`
  height: 100vh;
`;

const DragConstraint = styled(motion.div)``;

const BodyWrapper = styled(Layout)`
  margin-top: 48px;
`;

const ContentWrapper = styled(Content)`
  overflow: auto;
  height: 100%;
`;

const CMSSidebar = styled(Sider)`
  && {
    background-color: #fff;
    padding-bottom: 38px;
  }
  .ant-layout-sider-trigger {
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
    color: #002140;
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .ant-menu-inline {
    border-right: 1px solid white;
  }
  .ant-menu-vertical {
    border-right: none;
  }
`;

const HeaderWrapper = styled.div`
  position: fixed;
  z-index: 1;
  width: 100%;
`;

export default CMSWrapper;
