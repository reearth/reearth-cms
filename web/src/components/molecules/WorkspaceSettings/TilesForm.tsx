import styled from "@emotion/styled";
import { useState, useRef } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Card from "@reearth-cms/components/atoms/Card";
import Divider from "@reearth-cms/components/atoms/Divider";
import Icon from "@reearth-cms/components/atoms/Icon";
import Switch from "@reearth-cms/components/atoms/Switch";
import { Tiles, Tile } from "@reearth-cms/components/molecules/Workspace/types";
import GeospatialFormModal from "@reearth-cms/components/molecules/WorkspaceSettings/GeospatialFormModal";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  tiles?: Tile[];
  onWorkspaceTilesUpdate?: (tiles: Tiles) => Promise<void>;
};

const WorkspaceTilesForm: React.FC<Props> = ({ tiles }) => {
  const { Meta } = Card;
  const t = useT();

  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(false);
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
    <>
      <Title>{t("Tiles")}</Title>
      <SecondaryText>{t("The first one in the list will be the default Tile.")}</SecondaryText>
      <GridArea>
        {tiles?.map(tile => {
          return (
            <StyledCard
              actions={[
                <Icon icon="delete" key="delete" onClick={() => console.log("delete")} />,
                <Icon icon="edit" key="edit" onClick={onTileModalOpen} />,
              ]}
              key={tile.id}>
              <Meta title={tile.name} />
            </StyledCard>
          );
        })}
      </GridArea>

      <Button type="link" onClick={onTileModalOpen} icon={<Icon icon="plus" />}>
        {t("Add new Tiles option")}
      </Button>
      <Divider />
      <Title>{t("Terrain")}</Title>
      <SecondaryText>{t("The first one in the list will be the default Terrain.")}</SecondaryText>
      <SwitchWrapper>
        <Switch onChange={onChange} />
        <Text>{t("Enable")}</Text>
      </SwitchWrapper>
      {enable && (
        <Button type="link" onClick={onTerrainModalOpen} icon={<Icon icon="plus" />}>
          {t("Add new Terrain option")}
        </Button>
      )}
      <GeospatialFormModal open={open} onClose={onClose} isTile={isTileRef.current} />
    </>
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
  font-weight: 500;
`;

const SwitchWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const GridArea = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  padding-bottom: 12px;
`;

const StyledCard = styled(Card)`
  .ant-card-body {
    padding: 16px;
  }
`;
