import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { Workspace } from "@reearth-cms/components/molecules/Workspace/types";
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
  // workspaceName,
  onWorkspaceUpdate,
  onWorkspaceDelete,
}) => {
  const t = useT();

  const workspace: Workspace = {
    id: "addf",
    name: "WorkSpace1",
    tiles: {
      list: [
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
      ],
      default: "1",
      switching: false,
    },
  };

  return (
    <InnerContent title={t("Workspace Settings")}>
      <ContentSection title={t("General")}>
        <WorkspaceGeneralForm
          workspaceName={workspace.name}
          onWorkspaceUpdate={onWorkspaceUpdate}
        />
      </ContentSection>
      <ContentSection title={t("Tiles")}>
        <WorkspaceTilesForm tiles={workspace.tiles} />
      </ContentSection>
      <DangerZone onWorkspaceDelete={onWorkspaceDelete} />
    </InnerContent>
  );
};

export default WorkspaceSettings;
