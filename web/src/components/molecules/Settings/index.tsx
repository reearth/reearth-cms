import styled from "@emotion/styled";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";

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
  hasPrivilege: boolean;
};

const Settings: React.FC<Props> = ({
  workspaceSettings,
  onWorkspaceSettingsUpdate,
  hasPrivilege,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(workspaceSettings?.terrains?.enabled);
  const [settings, setSettings] = useState(workspaceSettings);

  useEffect(() => {
    if (!settings) setSettings(workspaceSettings);
  }, [settings, workspaceSettings]);

  const tiles: TileInput[] = useMemo(() => {
    const tiles: TileInput[] = [];
    settings?.tiles?.resources?.map(resource => tiles.push({ tile: resource }));
    return tiles;
  }, [settings?.tiles?.resources]);

  const terrains: TerrainInput[] = useMemo(() => {
    const terrains: TerrainInput[] = [];
    settings?.terrains?.resources?.map(resource => terrains.push({ terrain: resource }));
    return terrains;
  }, [settings?.terrains?.resources]);

  const isTileRef = useRef(true);
  const indexRef = useRef<undefined | number>(undefined);

  useEffect(() => {
    if (settings?.terrains?.enabled) setEnable(settings.terrains.enabled);
  }, [settings?.terrains?.enabled]);

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
    setSettings(prevState => {
      const s = { id: prevState?.id ?? "", ...prevState };
      if (s.terrains) s.terrains.enabled = checked;
      return s;
    });
  };

  const handleDelete = (isTile: boolean, index: number) => {
    const s: WorkspaceSettings = { id: settings?.id ?? "", ...settings };
    if (isTile) {
      tiles.splice(index, 1);
      s.tiles?.resources?.splice(index, 1);
    } else {
      terrains.splice(index, 1);
      s.terrains?.resources?.splice(index, 1);
    }
    setSettings(s);
  };

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number, isTile: boolean) => {
      if (toIndex < 0) return;
      const s: WorkspaceSettings = { id: settings?.id ?? "", ...settings };
      if (isTile) {
        const [removed] = tiles.splice(fromIndex, 1);
        tiles.splice(toIndex, 0, removed);
        if (s.tiles) {
          s.tiles.resources = tiles.map(tile => ({
            id: tile.tile.id,
            type: tile.tile.type,
            props: tile.tile.props,
          }));
        }
      } else {
        const [removed] = terrains.splice(fromIndex, 1);
        terrains.splice(toIndex, 0, removed);
        if (s.terrains) {
          s.terrains.resources = terrains.map(terrain => ({
            id: terrain.terrain.id,
            type: terrain.terrain.type,
            props: terrain.terrain.props,
          }));
        }
      }
      setSettings(s);
    },
    [settings, terrains, tiles],
  );

  const handleClick = () => {
    onWorkspaceSettingsUpdate(tiles, terrains);
  };

  return (
    <InnerContent title={t("Settings")}>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <Title>{t("Tiles")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
        {settings?.tiles?.resources?.length ? (
          <Cards
            resources={settings?.tiles?.resources}
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
            {settings?.terrains?.resources?.length ? (
              <Cards
                resources={settings?.terrains?.resources}
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
        <ButtonWrapper>
          <Button type="primary" onClick={handleClick}>
            Save
          </Button>
        </ButtonWrapper>
        <FormModal
          open={open}
          onClose={onClose}
          isTile={isTileRef.current}
          tiles={tiles}
          terrains={terrains}
          setSettings={setSettings}
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

const ButtonWrapper = styled.div`
  padding: 12px 0;
`;
