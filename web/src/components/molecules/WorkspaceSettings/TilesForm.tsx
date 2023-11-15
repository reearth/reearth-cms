import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import { Tiles } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  tiles?: Tiles;
  onWorkspaceTilesUpdate?: (tiles: Tiles) => Promise<void>;
};

const WorkspaceTilesForm: React.FC<Props> = ({ tiles, onWorkspaceTilesUpdate }) => {
  const [form] = Form.useForm();
  const { Option } = Select;
  const t = useT();

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    await onWorkspaceTilesUpdate?.(values);
  }, [form, onWorkspaceTilesUpdate]);

  return (
    <Form
      form={form}
      initialValues={{ list: tiles?.list, default: tiles?.default, switching: tiles?.switching }}
      layout="vertical"
      autoComplete="off">
      <Title>{t("Tiles")}</Title>
      <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
      <Form.List name="list">
        {(fields, { add, remove }) => (
          <>
            {fields.map(field => {
              return (
                <TileWrapper key={field.key}>
                  <Form.Item name={[field.name, "name"]} label="Name">
                    <Input />
                  </Form.Item>
                  <Form.Item name={[field.name, "url"]} label="URL">
                    <Input />
                  </Form.Item>
                  <Form.Item name={[field.name, "image"]} label="Image">
                    <Input />
                  </Form.Item>
                  <DeleteTileButtonWrapper>
                    <DeleteTileButton
                      onClick={() => {
                        remove(field.key);
                      }}
                      icon={<Icon icon="delete" />}
                    />
                  </DeleteTileButtonWrapper>
                </TileWrapper>
              );
            })}
            <AddTileButton onClick={add} icon={<Icon icon="plus" />}>
              {t("Add new Tile")}
            </AddTileButton>
          </>
        )}
      </Form.List>
      <Form.Item
        style={{ maxWidth: 400, marginBottom: 48 }}
        name="default"
        label={t("Default Terrain")}>
        <Select defaultValue={tiles?.default}>
          {tiles?.list.map(tile => (
            <Option key={tile.id} value={tile.id}>
              {tile.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="switching">
        <SwitchWrapper>
          <Switch />
          <Text>{t("Allow user to switch tiles")}</Text>
        </SwitchWrapper>
      </Form.Item>
      <Button onClick={handleSubmit} type="primary" htmlType="submit">
        {t("Save")}
      </Button>
    </Form>
  );
};

export default WorkspaceTilesForm;

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
`;

const SwitchWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const TileWrapper = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #d9d9d9;
  margin-bottom: 12px;
`;

const AddTileButton = styled(Button)`
  color: #1890ff;
  padding: 4px 4px 4px 17px;
  border: none;
  margin-bottom: 24px;
  &:hover,
  &:active,
  &:focus {
    color: #1890ff;
    background: rgba(0, 0, 0, 0.018);
  }
`;

const DeleteTileButton = styled(Button)`
  width: 22px;
  height: 22px;
  color: rgba(0, 0, 0, 0.45);
  border: none;
`;

const DeleteTileButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
