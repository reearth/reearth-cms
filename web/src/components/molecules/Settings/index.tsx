import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Loading from "@reearth-cms/components/atoms/Loading";
import Switch from "@reearth-cms/components/atoms/Switch";
import Cards from "@reearth-cms/components/molecules/Settings/Cards";
import FormModal from "@reearth-cms/components/molecules/Settings/FormModal";
import {
  TerrainInput,
  TileInput,
  WorkspaceSettings,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  hasUpdateRight: boolean;
  loading: boolean;
  onWorkspaceSettingsUpdate: (
    tiles: TileInput[],
    terrains: TerrainInput[],
    isEnable?: boolean,
  ) => Promise<void>;
  updateLoading: boolean;
  workspaceSettings: WorkspaceSettings;
};

const Settings: React.FC<Props> = ({
  hasUpdateRight,
  loading,
  onWorkspaceSettingsUpdate,
  updateLoading,
  workspaceSettings,
}) => {
  const t = useT();

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>();
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setSettings(workspaceSettings);
  }, [workspaceSettings]);

  useEffect(() => {
    setIsDisabled(JSON.stringify(workspaceSettings) === JSON.stringify(settings));
  }, [workspaceSettings, settings]);

  const tiles: TileInput[] = useMemo(() => {
    if (!settings?.tiles?.resources) return [];
    return settings?.tiles?.resources?.map(resource => ({ tile: resource }));
  }, [settings]);

  const terrains: TerrainInput[] = useMemo(() => {
    if (!settings?.terrains?.resources) return [];
    return settings?.terrains?.resources?.map(resource => ({ terrain: resource }));
  }, [settings]);

  const isTileRef = useRef(true);
  const indexRef = useRef<number | undefined>(undefined);

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

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onChange = useCallback((checked: boolean) => {
    setSettings(prevState => {
      if (!prevState) return;
      const copySettings = structuredClone(prevState);
      if (copySettings.terrains) copySettings.terrains.enabled = checked;
      return copySettings;
    });
  }, []);

  const handleDelete = useCallback(
    (isTile: boolean, index: number) => {
      if (!settings) return;
      const copySettings = structuredClone(settings);
      if (isTile) {
        copySettings.tiles?.resources?.splice(index, 1);
      } else {
        copySettings.terrains?.resources?.splice(index, 1);
      }
      setSettings(copySettings);
    },
    [settings],
  );

  const handleDragEnd = useCallback(
    (fromIndex: number, toIndex: number, isTile: boolean) => {
      if (toIndex < 0) return;
      if (!settings) return;
      const copySettings = structuredClone(settings);
      if (isTile) {
        if (!copySettings.tiles?.resources) return;
        const [removed] = copySettings.tiles.resources.splice(fromIndex, 1);
        copySettings.tiles.resources.splice(toIndex, 0, removed);
      } else {
        if (!copySettings.terrains?.resources) return;
        const [removed] = copySettings.terrains.resources.splice(fromIndex, 1);
        copySettings.terrains.resources.splice(toIndex, 0, removed);
      }
      setSettings(copySettings);
    },
    [settings],
  );

  const handleWorkspaceSettingsSave = useCallback(() => {
    onWorkspaceSettingsUpdate(tiles, terrains, settings?.terrains?.enabled);
  }, [onWorkspaceSettingsUpdate, settings?.terrains?.enabled, terrains, tiles]);

  return loading ? (
    <Loading minHeight="400px" />
  ) : (
    <InnerContent title={t("Settings")}>
      <ContentSection
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}
        title={t("Geospatial asset preview setting")}>
        <Title>{t("Tiles")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
        {settings?.tiles?.resources?.length ? (
          <Cards
            hasUpdateRight={hasUpdateRight}
            isTile={true}
            onDelete={handleDelete}
            onDragEnd={handleDragEnd}
            onModalOpen={onTileModalOpen}
            resources={settings?.tiles?.resources}
          />
        ) : null}
        <Button
          disabled={!hasUpdateRight}
          icon={<Icon icon="plus" />}
          onClick={() => onTileModalOpen()}
          type="link">
          {t("Add new Tiles option")}
        </Button>
        <Divider />
        <Title>{t("Terrain")}</Title>
        <SecondaryText>{t("The first one in the list will be the default Terrain.")}</SecondaryText>
        <SwitchWrapper>
          <Switch
            checked={settings?.terrains?.enabled}
            disabled={!hasUpdateRight}
            onChange={onChange}
          />
          <Text>{t("Enable")}</Text>
        </SwitchWrapper>
        {settings?.terrains?.enabled && (
          <>
            {settings?.terrains?.resources?.length ? (
              <Cards
                hasUpdateRight={hasUpdateRight}
                isTile={false}
                onDelete={handleDelete}
                onDragEnd={handleDragEnd}
                onModalOpen={onTerrainModalOpen}
                resources={settings?.terrains?.resources}
              />
            ) : null}
            <Button
              disabled={!hasUpdateRight}
              icon={<Icon icon="plus" />}
              onClick={() => onTerrainModalOpen()}
              type="link">
              {t("Add new Terrain option")}
            </Button>
          </>
        )}
        <ButtonWrapper>
          <Button
            disabled={isDisabled}
            loading={updateLoading}
            onClick={handleWorkspaceSettingsSave}
            type="primary">
            {t("Save")}
          </Button>
        </ButtonWrapper>
        <FormModal
          index={indexRef.current}
          isTile={isTileRef.current}
          onClose={onClose}
          open={open}
          setSettings={setSettings}
          terrains={terrains}
          tiles={tiles}
        />
      </ContentSection>
    </InnerContent>
  );
};

export default Settings;

const Title = styled.h3`
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
