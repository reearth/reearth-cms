import styled from "@emotion/styled";
import { Link } from "react-router";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { useT, Trans } from "@reearth-cms/i18n";

type Props = {
  projectId?: string;
  workspaceId?: string;
  selectedAsset?: ItemAsset;
  onSelectFile: () => void;
};

const FileSelectionStep: React.FC<Props> = ({
  projectId,
  workspaceId,
  selectedAsset,
  onSelectFile,
}) => {
  const t = useT();

  return (
    <>
      <Section>
        <SectionTitle>{t("Select file")}</SectionTitle>
        {selectedAsset ? (
          <AssetWrapper>
            <AssetDetailsWrapper>
              <AssetButton enabled={!!selectedAsset} onClick={onSelectFile}>
                <Icon icon="folder" size={24} />
                <AssetName>{selectedAsset?.fileName}</AssetName>
              </AssetButton>
              <Tooltip title={selectedAsset.fileName}>
                <Link
                  to={`/workspace/${workspaceId}/project/${projectId}/asset/${selectedAsset.id}`}
                  target="_blank">
                  <AssetLinkedName type="link">{selectedAsset.fileName}</AssetLinkedName>
                </Link>
              </Tooltip>
            </AssetDetailsWrapper>
            <Space />
          </AssetWrapper>
        ) : (
          <AssetButton onClick={onSelectFile}>
            <Icon icon="plus" size={14} />
            <AssetButtonTitle>{t("Select")}</AssetButtonTitle>
          </AssetButton>
        )}
      </Section>
      <Section>
        <SectionTitle>{t("Notes")}</SectionTitle>
        <Trans
          i18nKey="importSchemaNotes"
          components={{
            l1: (
              <TemplateFileLink type="link" href="/templates/template.json" download>
                JSON
              </TemplateFileLink>
            ),
            l2: (
              <TemplateFileLink type="link" href="/templates/template.geojson" download>
                GeoJSON
              </TemplateFileLink>
            ),
          }}
        />
      </Section>
    </>
  );
};

export default FileSelectionStep;

const Section = styled.div`
  margin-top: 24px;
`;

const SectionTitle = styled.h3``;

const AssetButton = styled(Button)<{ enabled?: boolean }>`
  width: 104px;
  height: 104px;
  border: 1px dashed;
  border-color: ${({ enabled }) => (enabled ? "#d9d9d9" : "#00000040")};
  color: ${({ enabled }) => (enabled ? "#000000D9" : "#00000040")};
  padding: 0 5px;
  flex-flow: column;
`;

const Space = styled.div`
  flex: 1;
`;

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const AssetLinkedName = styled(Button)<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? "#00000040" : "#1890ff")};
  margin-left: 12px;
  span {
    text-align: start;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }
`;

const AssetDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AssetName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AssetButtonTitle = styled.div`
  margin-top: 4px;
`;

const TemplateFileLink = styled(Button)`
  padding: 0;
`;
