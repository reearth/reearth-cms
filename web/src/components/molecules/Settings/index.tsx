import styled from "@emotion/styled";
import { useState, useRef, useEffect, useCallback } from "react";

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
  tiles: TileInput[];
  terrains: TerrainInput[];
  onWorkspaceSettingsUpdate: (tiles: TileInput[], terrains: TerrainInput[]) => Promise<void>;
  onTerrainToggle: (isEnable: boolean) => void;
  hasPrivilege: boolean;
};

const Settings: React.FC<Props> = ({
  workspaceSettings,
  tiles,
  terrains,
  onWorkspaceSettingsUpdate,
  onTerrainToggle,
  hasPrivilege,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(workspaceSettings?.terrains?.enabled);

  const isTileRef = useRef(true);
  const indexRef = useRef<undefined | number>(undefined);

  useEffect(() => {
    if (workspaceSettings?.terrains?.enabled) setEnable(workspaceSettings.terrains.enabled);
  }, [workspaceSettings?.terrains?.enabled]);

  const onTileModalOpen = (index?: number) => {
    setOpen(true);
    isTileRef.current = true;
    indexRef.current = index;
  };

  const onTerrainModalOpen = (index?: number) => {
    setOpen(true);
    isTileRef.current = false;
    indexRef.current = index;
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (checked: boolean) => {
    setEnable(checked);
    onTerrainToggle(checked);
  };

  const handleDelete = (isTile: boolean, index: number) => {
    if (isTile) {
      tiles.splice(index, 1);
    } else {
      terrains.splice(index, 1);
    }
    onWorkspaceSettingsUpdate(tiles, terrains);
  };

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number, isTile: boolean) => {
      if (toIndex < 0) return;
      if (isTile) {
        const [removed] = tiles.splice(fromIndex, 1);
        tiles.splice(toIndex, 0, removed);
      } else {
        const [removed] = terrains.splice(fromIndex, 1);
        terrains.splice(toIndex, 0, removed);
      }
      onWorkspaceSettingsUpdate(tiles, terrains);
    },
    [onWorkspaceSettingsUpdate, terrains, tiles],
  );

  return (
    <InnerContent title={t("Settings")}>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <Title>{t("Tiles")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
        {workspaceSettings?.tiles?.resources?.length ? (
          <Cards
            resources={workspaceSettings?.tiles?.resources}
            onModalOpen={onTileModalOpen}
            isTile={true}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
          />
        ) : null}
        <Button type="link" onClick={() => onTileModalOpen()} icon={<Icon icon="plus" />}>
          {t("Add new Tiles option")}
        </Button>
        <Divider />
        <Title>{t("Terrain")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Terrain.")}</SecondaryText>
        <SwitchWrapper>
          <Switch checked={enable} onChange={onChange} disabled={!hasPrivilege} />
          <Text>{t("Enable")}</Text>
        </SwitchWrapper>
        {enable && (
          <>
            {workspaceSettings?.terrains?.resources?.length ? (
              <Cards
                resources={workspaceSettings?.terrains?.resources}
                onModalOpen={onTerrainModalOpen}
                isTile={false}
                onDelete={handleDelete}
                onDragEnd={handleDragEnd}
              />
            ) : null}
            <Button type="link" onClick={() => onTerrainModalOpen()} icon={<Icon icon="plus" />}>
              {t("Add new Terrain option")}
            </Button>
          </>
        )}
        <FormModal
          open={open}
          onClose={onClose}
          isTile={isTileRef.current}
          tiles={tiles}
          terrains={terrains}
          onWorkspaceSettingsUpdate={onWorkspaceSettingsUpdate}
          index={indexRef.current}
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
