import styled from "@emotion/styled";
import { useCallback, useState, useEffect, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import { Model } from "@reearth-cms/components/molecules/ProjectOverview";
import { TileType, TerrainType } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

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
  onCreate?: (values: FormValues) => Promise<void> | void;
  onUpdate?: (values: FormValues) => Promise<void> | void;
  isTile: boolean;
}

const GeospatialFormModal: React.FC<Props> = ({
  model,
  open,
  onClose,
  onCreate,
  onUpdate,
  isTile,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [extraOpen, setExtraOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (!model) {
        form.resetFields();
      } else {
        form.setFieldsValue(model);
      }
      setExtraOpen(false);
    }
  }, [form, model, open]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    console.log(values);
    onClose();
  }, [form, onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const typeEnum = useMemo(() => (isTile ? TileType : TerrainType), [isTile]);
  const options = useMemo(
    () =>
      Object.keys(typeEnum).map(key => ({
        value: key,
        label: typeEnum[key as keyof typeof typeEnum],
      })),
    [typeEnum],
  );

  const handleSelect = useCallback((value: string) => {
    if (value === "URL" || value === "CESIUM_ION") {
      setExtraOpen(true);
    }
  }, []);

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

export default GeospatialFormModal;

const Text = styled.p`
  color: #00000073;
  margin: 0;
`;
