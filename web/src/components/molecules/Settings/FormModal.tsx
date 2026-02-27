import { useCallback, useEffect, useMemo, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { Rule } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import {
  TerrainInput,
  TerrainType,
  TileInput,
  TileType,
  WorkspaceSettings,
} from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";
import { validateURL } from "@reearth-cms/utils/regex";

type FormValues = {
  cesiumIonAccessToken?: string;
  cesiumIonAssetId?: string;
  image?: string;
  name?: string;
  type: TerrainType | TileType;
  url?: string;
};

/* eslint-disable perfectionist/sort-objects -- Order defines dropdown option order; first entry is the default */
export const TileTypeFormat: Record<TileType, string> = {
  DEFAULT: "Default",
  LABELLED: "Labelled",
  ROAD_MAP: "Road Map",
  OPEN_STREET_MAP: "OpenStreetMap",
  ESRI_TOPOGRAPHY: "ESRI Topography",
  EARTH_AT_NIGHT: "Earth at night",
  JAPAN_GSI_STANDARD_MAP: "Japan GSI Standard Map",
  URL: "URL",
};

export const TerrainTypeFormat: Record<TerrainType, string> = {
  CESIUM_WORLD_TERRAIN: "Cesium World Terrain",
  ARC_GIS_TERRAIN: "ArcGIS Terrain",
  CESIUM_ION: "Cesium Ion",
};
/* eslint-enable perfectionist/sort-objects */

type Props = {
  index?: number;
  isTile: boolean;
  onClose: () => void;
  open: boolean;
  setSettings: React.Dispatch<React.SetStateAction<undefined | WorkspaceSettings>>;
  terrains: TerrainInput[];
  tiles: TileInput[];
};

const FormModal: React.FC<Props> = ({
  index,
  isTile,
  onClose,
  open,
  setSettings,
  terrains,
  tiles,
}) => {
  const t = useT();
  const [form] = Form.useForm<FormValues>();
  const [extraOpen, setExtraOpen] = useState(false);

  const options = useMemo(() => {
    const typeFormat = isTile ? TileTypeFormat : TerrainTypeFormat;
    return Object.keys(typeFormat).map(key => ({
      label: typeFormat[key as keyof typeof typeFormat],
      value: key,
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
          form.setFieldsValue(resource.props);
          return resource.type;
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

  const title = useMemo(
    () =>
      index === undefined
        ? isTile
          ? t("New Tiles")
          : t("New Terrain")
        : isTile
          ? t("Update Tiles")
          : t("Update Terrain"),
    [index, isTile, t],
  );

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
    const values = await form.validateFields();
    const { cesiumIonAccessToken, cesiumIonAssetId, image, name, type, url } = values;
    setSettings(prevState => {
      if (!prevState) return;
      const copySettings = structuredClone(prevState);
      if (isTile) {
        if (!copySettings.tiles) {
          copySettings.tiles = {
            resources: [],
          };
        }
        const newTile = {
          id: newID(),
          props: { image: image ?? "", name: name ?? "", url: url ?? "" },
          type: type as TileType,
        };
        if (index === undefined) {
          copySettings.tiles.resources.push(newTile);
        } else {
          copySettings.tiles.resources[index] = newTile;
        }
      } else {
        if (!copySettings.terrains) {
          copySettings.terrains = {
            resources: [],
          };
        }
        const newTerrain = {
          id: newID(),
          props: {
            cesiumIonAccessToken: cesiumIonAccessToken ?? "",
            cesiumIonAssetId: cesiumIonAssetId ?? "",
            image: image ?? "",
            name: name ?? "",
            url: url ?? "",
          },
          type: type as TerrainType,
        };
        if (index === undefined) {
          copySettings.terrains.resources.push(newTerrain);
        } else {
          copySettings.terrains.resources[index] = newTerrain;
        }
      }
      return copySettings;
    });
    onClose();
  }, [form, index, isTile, onClose, setSettings]);

  const urlRules = useMemo(
    () => [
      {
        message: t("URL is not valid"),
        validator: async (_: Rule, value: string) => {
          return value && !validateURL(value) ? Promise.reject() : Promise.resolve();
        },
      },
    ],
    [t],
  );

  return (
    <Modal
      footer={[
        <Button key="submit" onClick={handleSubmit} type="primary">
          OK
        </Button>,
      ]}
      onCancel={handleClose}
      open={open}
      title={title}>
      <Form form={form} layout="vertical">
        <Form.Item label={isTile ? t("Tiles type") : t("Terrain type")} name="type">
          <Select onSelect={handleSelect} options={options} />
        </Form.Item>
        {extraOpen ? (
          isTile ? (
            <>
              <Form.Item extra={t("Name of tiles")} label={t("Name")} name="name">
                <Input />
              </Form.Item>
              <Form.Item label={t("URL")} name="url" rules={urlRules}>
                <Input />
              </Form.Item>
              <Form.Item label={t("Image URL")} name="image" rules={urlRules}>
                <Input />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item extra={t("Name of terrain")} label={t("Name")} name="name">
                <Input />
              </Form.Item>
              <Form.Item label={t("Terrain Cesium Ion asset ID")} name="cesiumIonAssetId">
                <Input />
              </Form.Item>
              <Form.Item label={t("Terrain Cesium Ion access token")} name="cesiumIonAccessToken">
                <Input />
              </Form.Item>
              <Form.Item label={t("Terrain URL")} name="url" rules={urlRules}>
                <Input />
              </Form.Item>
              <Form.Item label={t("Image URL")} name="image" rules={urlRules}>
                <Input />
              </Form.Item>
            </>
          )
        ) : undefined}
      </Form>
    </Modal>
  );
};

export default FormModal;
