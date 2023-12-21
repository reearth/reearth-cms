import styled from "@emotion/styled";
import { useCallback, useState, useEffect, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { Model } from "@reearth-cms/components/molecules/ProjectOverview";
import {
  TileType,
  TerrainType,
  WorkspaceSettings,
  TileInput,
  TerrainInput,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

export interface FormValues {
  id?: string;
  name: string;
  description: string;
  key: string;
}

export interface Props {
  model?: Model;
  open?: boolean;
  onClose: () => void;
  workspaceSettings?: WorkspaceSettings;
  onWorkspaceSettingsUpdate: (tiles: TileInput[], terrains: TerrainInput[]) => Promise<void>;
  isTile: boolean;
}

const FormModal: React.FC<Props> = ({
  open,
  onClose,
  workspaceSettings,
  onWorkspaceSettingsUpdate,
  isTile,
}) => {
  const t = useT();
  const [form] = Form.useForm<{ type: keyof typeof TileType | keyof typeof TerrainType }>();
  const [extraOpen, setExtraOpen] = useState(false);

  const typeEnum = useMemo(() => (isTile ? TileType : TerrainType), [isTile]);
  const options = useMemo(
    () =>
      Object.keys(typeEnum).map(key => ({
        value: key,
        label: typeEnum[key as keyof typeof typeEnum],
      })),
    [typeEnum],
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldValue("type", options[0].value);
      setExtraOpen(false);
    }
  }, [form, open, options]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((value: string) => {
    if (value === "URL" || value === "CESIUM_ION") {
      setExtraOpen(true);
    } else {
      setExtraOpen(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const values = form.getFieldsValue();
    const { type } = values;
    const tiles: TileInput[] = [];
    workspaceSettings?.tiles?.resources?.map(resource => tiles.push({ tile: resource }));
    const terrains: TerrainInput[] = [];
    workspaceSettings?.terrains?.resources?.map(resource => terrains.push({ terrain: resource }));
    if (isTile) {
      tiles.push({
        tile: {
          id: newID(),
          type: type as keyof typeof TileType,
          props: { name: "", url: "", image: "" },
        },
      });
    } else {
      terrains.push({
        terrain: {
          id: newID(),
          type: type as keyof typeof TerrainType,
          props: { name: "", url: "", image: "", cesiumIonAssetId: "", cesiumIonAccessToken: "" },
        },
      });
    }
    onWorkspaceSettingsUpdate(tiles, terrains);
    onClose();
  }, [form, onClose, onWorkspaceSettingsUpdate]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={isTile ? t("New Tiles") : t("New Terrain")}
      footer={[
        <Button key="submit" type="primary" onClick={handleSubmit}>
          OK
        </Button>,
      ]}>
      <Form form={form} layout="vertical">
        <Form.Item name="type" label={isTile ? t("Tiles type") : t("Terrain type")}>
          <Select defaultValue={options[0].value} options={options} onSelect={handleSelect} />
        </Form.Item>
        {extraOpen ? (
          isTile ? (
            <>
              <Form.Item name="name" label={t("Name")}>
                <Input placeholder={t("example")} />
                <Text>{t("Name of tiles")}</Text>
              </Form.Item>
              <Form.Item name="url" label={t("URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="imageUrl" label={t("Image URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="name" label={t("Name")}>
                <Input placeholder={t("example")} />
                <Text>{t("Name of terrain")}</Text>
              </Form.Item>
              <Form.Item name="assetId" label={t("Terrain Cesium Ion asset ID")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="accessToken" label={t("Terrain Cesium Ion access token")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="terrainUrl" label={t("Terrain URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="imageUrl" label={t("Image URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
            </>
          )
        ) : undefined}
      </Form>
    </Modal>
  );
};

export default FormModal;

const Text = styled.p`
  color: #00000073;
  margin: 0;
`;
