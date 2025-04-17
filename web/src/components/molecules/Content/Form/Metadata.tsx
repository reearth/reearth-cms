import styled from "@emotion/styled";

import Status from "@reearth-cms/components/molecules/Content/Status";
import { Item } from "@reearth-cms/components/molecules/Content/types";
import { MetadataField } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

type Props = {
  item?: Item;
  fields: MetadataField[];
  disabled: boolean;
};

const Metadata: React.FC<Props> = ({ item, fields, disabled }) => {
  const t = useT();

  return (
    <>
      {item && (
        <>
          <div>
            <CardTitle>{t("Item Information")}</CardTitle>
            <ItemInfo>
              <DataRow>
                <DataTitle>ID</DataTitle>
                <ID>{item.id}</ID>
              </DataRow>
              <DataRow>
                <DataTitle>{t("Created At")}</DataTitle>
                <DataText>{dateTimeFormat(item.createdAt)}</DataText>
              </DataRow>
              <DataRow>
                <DataTitle>{t("Created By")}</DataTitle>
                <DataText>{item.createdBy?.name}</DataText>
              </DataRow>
              <DataRow>
                <DataTitle>{t("Updated At")}</DataTitle>
                <DataText>{dateTimeFormat(item.updatedAt)}</DataText>
              </DataRow>
              <DataRow>
                <DataTitle>{t("Updated By")}</DataTitle>
                <DataText>{item.updatedBy?.name}</DataText>
              </DataRow>
            </ItemInfo>
          </div>
          <div>
            <CardTitle>{t("Publish State")}</CardTitle>
            <CardValue>
              <DataTitle>
                <Status status={item.status} />
              </DataTitle>
            </CardValue>
          </div>
        </>
      )}
      {fields.length > 0 && (
        <div>
          <CardTitle>{t("Customized meta data")}</CardTitle>
          <MetadataWrapper>
            {fields.map(field => {
              const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
              return (
                <MetaFormItemWrapper key={field.id}>
                  <FieldComponent field={field} disabled={disabled} />
                </MetaFormItemWrapper>
              );
            })}
          </MetadataWrapper>
        </div>
      )}
    </>
  );
};

const CardTitle = styled.h4`
  font-weight: 400;
  font-size: 13px;
  color: #898989;
  margin-bottom: 8px;
`;

const CardValue = styled.div`
  padding: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
`;

const ItemInfo = styled(CardValue)`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetadataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetaFormItemWrapper = styled(CardValue)`
  .ant-form-item {
    margin-bottom: 0;
  }
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const DataTitle = styled.p`
  font-size: 14px;
  margin: 0;
`;

const DataCommon = styled.p`
  font-size: 12px;
  margin: 0;
  padding: 4px 8px;
`;

const DataText = styled(DataCommon)`
  color: #8c8c8c;
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ID = styled(DataCommon)`
  color: #848484;
  background-color: #f0f0f0;
  border-radius: 4px;
  min-width: 0;
`;

export default Metadata;
