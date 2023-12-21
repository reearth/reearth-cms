import styled from "@emotion/styled";
import { useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Switch from "@reearth-cms/components/atoms/Switch";
import Cards from "@reearth-cms/components/molecules/Settings/Cards";
import FormModal from "@reearth-cms/components/molecules/Settings/FormModal";
import {
  WorkspaceSettings,
  TileInput,
  TerrainInput,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  workspaceSettings?: WorkspaceSettings;
  onWorkspaceSettingsUpdate: (tiles: TileInput[], terrains: TerrainInput[]) => Promise<void>;
};

const Settings: React.FC<Props> = ({ workspaceSettings, onWorkspaceSettingsUpdate }) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(workspaceSettings?.terrains?.enabled);
  const isTileRef = useRef(true);

  const onTileModalOpen = () => {
    setOpen(true);
    isTileRef.current = true;
  };

  const onTerrainModalOpen = () => {
    setOpen(true);
    isTileRef.current = false;
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (checked: boolean) => {
    setEnable(checked);
  };

  return (
    <InnerContent title={t("Settings")}>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <Title>{t("Tiles")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
        {workspaceSettings?.tiles?.resources?.length ? (
          <Cards resources={workspaceSettings?.tiles?.resources} onModalOpen={onTileModalOpen} />
        ) : null}
        <Button type="link" onClick={onTileModalOpen} icon={<Icon icon="plus" />}>
          {t("Add new Tiles option")}
        </Button>
        <Divider />
        <Title>{t("Terrain")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Terrain.")}</SecondaryText>
        <SwitchWrapper>
          <Switch defaultChecked={enable} onChange={onChange} />
          <Text>{t("Enable")}</Text>
        </SwitchWrapper>
        {enable && (
          <>
            {workspaceSettings?.terrains?.resources?.length ? (
              <Cards
                resources={workspaceSettings?.terrains?.resources}
                onModalOpen={onTerrainModalOpen}
              />
            ) : null}
            <Button type="link" onClick={onTerrainModalOpen} icon={<Icon icon="plus" />}>
              {t("Add new Terrain option")}
            </Button>
          </>
        )}
        <FormModal
          open={open}
          onClose={onClose}
          isTile={isTileRef.current}
          workspaceSettings={workspaceSettings}
          onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
        />
      </ContentSection>
    </InnerContent>
  );
};

export default Settings;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
`;

const SecondaryText = styled.p`
  color: #00000073;
  margin-bottom: 12px;
`;

const Text = styled.p`
  color: rgb(0, 0, 0, 0.85);
  font-weight: 500;
`;

const SwitchWrapper = styled.div`
  display: flex;
  gap: 8px;
`;
