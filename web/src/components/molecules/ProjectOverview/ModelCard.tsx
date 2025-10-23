import styled from "@emotion/styled";
import { message } from "antd";
import { useCallback, useMemo } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  model: Model;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onSchemaNavigate: (modelId: string) => void;
  onContentNavigate: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
  onModelExportModalOpen: (model: Model) => Promise<void>;
  onModelExport: (modelId: string, format: string) => Promise<void>;
};

const ModelCard: React.FC<Props> = ({
  model,
  hasUpdateRight,
  hasDeleteRight,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
  onModelExport,
}) => {
  const { Meta } = Card;
  const t = useT();

  const OptionsMenuItems = useMemo(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
        disabled: !hasUpdateRight,
      },
      {
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
        danger: true,
        disabled: !hasDeleteRight,
      },
    ],
    [t, hasUpdateRight, hasDeleteRight, onModelUpdateModalOpen, model, onModelDeletionModalOpen],
  );

  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable";
  const handleModelExportClick = useCallback(
    async (model: Model, exportType: string) => {
      messageApi.open({
        key,
        type: "loading",
        content: (
          <StyledMessage>
            <StyledMessageTitle>Preparing data export</StyledMessageTitle>
            <StyledMessageContent>
              Your file is being prepared. This may take a few seconds.
            </StyledMessageContent>
          </StyledMessage>
        ),
      });

      try {
        await onModelExport(model.id, exportType);
        messageApi.open({
          key,
          type: "success",
          content: (
            <StyledMessage>
              <StyledMessageTitle>Data export complete</StyledMessageTitle>
              <StyledMessageContent>Your file has been successfully exported.</StyledMessageContent>
            </StyledMessage>
          ),
          duration: 2000,
        });
      } catch {
        messageApi.open({
          key,
          type: "error",
          content: (
            <StyledMessage>
              <StyledMessageTitle>Export failed</StyledMessageTitle>
              <StyledMessageContent>Failed to export data. Please try again.</StyledMessageContent>
            </StyledMessage>
          ),
          duration: 2000,
        });
      }
    },
    [messageApi, onModelExport],
  );

  const ExportMenuItems = useMemo(
    () => [
      {
        key: "schema",
        label: t("Export Schema"),
        onClick: () => handleModelExportClick(model, "schema"),
      },
      {
        key: "json",
        label: t("Export as JSON"),
        onClick: () => handleModelExportClick(model, "json"),
      },
      {
        key: "csv",
        label: t("Export as CSV"),
        onClick: () => handleModelExportClick(model, "csv"),
      },
      {
        key: "geojson",
        label: t("Export as GeoJSON"),
        onClick: () => handleModelExportClick(model, "geojson"),
      },
    ],
    [t, handleModelExportClick, model],
  );

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate(model.id)} />,
        <>
          {contextHolder}
          <Dropdown key="export" menu={{ items: ExportMenuItems }} trigger={["click"]}>
            <a onClick={e => e.preventDefault()}>
              <Icon icon="download" />
            </a>
          </Dropdown>
        </>,
        <Dropdown key="options" menu={{ items: OptionsMenuItems }} trigger={["click"]}>
          <a onClick={e => e.preventDefault()}>
            <Icon icon="ellipsis" />
          </a>
        </Dropdown>,
      ]}>
      <Meta title={model.name} description={model.description} />
    </StyledCard>
  );
};

export default ModelCard;

const StyledCard = styled(Card)`
  .ant-card-body {
    height: 102px;
  }
  .ant-card-meta-description {
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
  .ant-message-custom-content {
    font-size: 32px !important;
  }
`;

const StyledMessage = styled.div`
  width: 400px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
`;

const StyledMessageTitle = styled.h3`
  width: 350px;
`;

const StyledMessageContent = styled.p`
  width: 350px;
`;
