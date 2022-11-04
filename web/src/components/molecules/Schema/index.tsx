import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Sider from "@reearth-cms/components/atoms/Sider";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import { Field, FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  collapsed?: boolean;
  model?: Model;
  modelsMenu?: JSX.Element;
  onCollapse?: (collapse: boolean) => void;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: FieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
};

const Schema: React.FC<Props> = ({
  collapsed,
  model,
  modelsMenu,
  onCollapse,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
}) => {
  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "modelMenuOpen" : "modelMenuClose"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        <Content>
          <PageHeader title={model?.name} subTitle={model?.key ? "#" + model.key : null} />
          <ModelFieldListWrapper>
            <ModelFieldList
              fields={model?.schema.fields}
              handleFieldUpdateModalOpen={onFieldUpdateModalOpen}
              handleFieldDelete={onFieldDelete}
            />
          </ModelFieldListWrapper>
        </Content>
      }
      right={
        <FieldListWrapper>
          <FieldList addField={onFieldCreationModalOpen} />
        </FieldListWrapper>
      }
    />
  );
};

export default Schema;

const Content = styled.div`
  width: 100%;
  background: #fafafa;
`;

const ModelFieldListWrapper = styled.div`
  padding: 24px;
`;

const FieldListWrapper = styled.div`
  height: 100%;
  width: 272px;
  padding: 12px;
  overflow-y: auto;
`;

const Sidebar = styled(Sider)`
  background-color: #fff;

  .ant-layout-sider-trigger {
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
    color: #002140;
    text-align: left;
    padding: 0 20px;
    margin: 0;
    height: 38px;
    line-height: 38px;
    cursor: pointer;
  }
  .ant-layout-sider-children {
    height: calc(100% + 12px);
  }
  .ant-menu-inline {
    border-right: 1px solid white;

    & > li {
      padding: 0 20px;
    }
  }
  .ant-menu-vertical {
    border-right: none;
  }
`;
