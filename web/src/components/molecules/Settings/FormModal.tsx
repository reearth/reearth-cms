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
  TileInput,
  TerrainInput,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

type FormValues = {
  type: keyof typeof TileType | keyof typeof TerrainType;
  name?: string;
  url?: string;
  image?: string;
  cesiumIonAssetId?: string;
  cesiumIonAccessToken?: string;
};

export interface Props {
  model?: Model;
  open?: boolean;
  onClose: () => void;
  tiles: TileInput[];
  terrains: TerrainInput[];
  onWorkspaceSettingsUpdate: (tiles: TileInput[], terrains: TerrainInput[]) => Promise<void>;
  isTile: boolean;
  index?: number;
}

const FormModal: React.FC<Props> = ({
  open,
  onClose,
  tiles,
  terrains,
  onWorkspaceSettingsUpdate,
  isTile,
  index,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [extraOpen, setExtraOpen] = useState(false);

  const options = useMemo(() => {
    const typeEnum = isTile ? TileType : TerrainType;
    return Object.keys(typeEnum).map(key => ({
      value: key,
      label: typeEnum[key as keyof typeof typeEnum],
    }));
  }, [isTile]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      const value = (() => {
        if (index === undefined) {
          return options[0].value;
        } else {
          const resource = isTile ? tiles[index].tile : terrains[index].terrain;
          resource?.props && form.setFieldsValue(resource.props);
          return resource?.type;
        }
      })();
      form.setFieldValue("type", value);
      if (value === "URL" || value === "CESIUM_ION") {
        setExtraOpen(true);
      } else {
        setExtraOpen(false);
      }
    }
  }, [form, index, isTile, open, options, terrains, tiles]);

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
    const { type, name, url, image, cesiumIonAssetId, cesiumIonAccessToken } = values;
    if (isTile) {
      const newTile = {
        tile: {
          id: newID(),
          type: type as keyof typeof TileType,
          props: { name: name ?? "", url: url ?? "", image: image ?? "" },
        },
      };
      if (index === undefined) {
        tiles.push(newTile);
      } else {
        tiles[index] = newTile;
      }
    } else {
      const newTerrain = {
        terrain: {
          id: newID(),
          type: type as keyof typeof TerrainType,
          props: {
            name: name ?? "",
            url: url ?? "",
            image: image ?? "",
            cesiumIonAssetId: cesiumIonAssetId ?? "",
            cesiumIonAccessToken: cesiumIonAccessToken ?? "",
          },
        },
      };
      if (index === undefined) {
        terrains.push(newTerrain);
      } else {
        terrains[index] = newTerrain;
      }
    }
    onWorkspaceSettingsUpdate(tiles, terrains);
    onClose();
  }, [form, index, isTile, onClose, onWorkspaceSettingsUpdate, terrains, tiles]);

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
          <Select options={options} onSelect={handleSelect} />
        </Form.Item>
        {extraOpen ? (
          isTile ? (
            <>
              <Form.Item name="name" label={t("Name")} extra={t("Name of tiles")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="url" label={t("URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="image" label={t("Image URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="name" label={t("Name")} extra={t("Name of terrain")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="cesiumIonAssetId" label={t("Terrain Cesium Ion asset ID")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="cesiumIonAccessToken" label={t("Terrain Cesium Ion access token")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="url" label={t("Terrain URL")}>
                <Input placeholder={t("example")} />
              </Form.Item>
              <Form.Item name="image" label={t("Image URL")}>
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
