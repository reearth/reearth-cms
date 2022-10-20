import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import Sider from "@reearth-cms/components/atoms/Sider";
import FieldList from "@reearth-cms/components/molecules/Schema/FieldList";
import ModelFieldList from "@reearth-cms/components/molecules/Schema/ModelFieldList";
import { Field, FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  collapsed?: boolean;
  model?: Model;
  onCollapse?: (collapse: boolean) => void;
  selectModel: (modelId: string) => void;
  onFieldUpdateModalOpen: (field: Field) => void;
  onFieldCreationModalOpen: (fieldType: FieldType) => void;
  onFieldDelete: (fieldId: string) => Promise<void>;
};

const Schema: React.FC<Props> = ({
  collapsed,
  model,
  selectModel,
  onCollapse,
  onFieldUpdateModalOpen,
  onFieldCreationModalOpen,
  onFieldDelete,
}) => {
  const t = useT();

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
          <ModelsMenu title={t("Schema")} collapsed={collapsed} selectModel={selectModel} />
        </Sidebar>
      }
      center={
        <Content>
          {model?.name && (
            <TitleWrapper>
              <ModelTitle>{model.name}</ModelTitle>
            </TitleWrapper>
          )}
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

const ModelTitle = styled.p`
  font-weight: 500;
  font-size: 20px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.85);
  word-break: break-all;
  width: 100%;
  margin: 0;
`;

const TitleWrapper = styled.div`
  display: flex;
  padding: 22px 24px;
  background-color: #fff;
`;

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
