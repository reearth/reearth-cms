import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceGeneralForm from "@reearth-cms/components/molecules/WorkspaceSettings/GeneralForm";
import WorkspaceTilesForm from "@reearth-cms/components/molecules/WorkspaceSettings/TilesForm";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  workspaceName?: string;
  onWorkspaceUpdate: (name?: string | undefined) => Promise<void>;
  onWorkspaceDelete: () => Promise<void>;
};

const WorkspaceSettings: React.FC<Props> = ({
  workspaceName,
  onWorkspaceUpdate,
  onWorkspaceDelete,
}) => {
  const t = useT();

  const tiles = [
    {
      id: "1",
      name: "tile1",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
    {
      id: "2",
      name: "tile2",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
    {
      id: "3",
      name: "tile3",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
  ];

  return (
    <InnerContent title={t("Workspace Settings")}>
      <ContentSection title={t("General")}>
        <WorkspaceGeneralForm workspaceName={workspaceName} onWorkspaceUpdate={onWorkspaceUpdate} />
      </ContentSection>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <WorkspaceTilesForm tiles={tiles} />
      </ContentSection>
      <DangerZone onWorkspaceDelete={onWorkspaceDelete} />
    </InnerContent>
  );
};

export default WorkspaceSettings;
