import styled from "@emotion/styled";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onModelSearch: (value: string) => void;
};

const ProjectHeader: React.FC<Props> = ({ onModelSearch }) => {
  const t = useT();

  return (
    <Container>
      <StyledSearch
        onSearch={onModelSearch}
        placeholder={t("search models")}
        allowClear
        type="text"
      />
      <Wrapper>
        <Label>{t("Sort by")}</Label>
        <StyledSelect defaultValue="Last Modified">
          <Select.Option key="updatedAt" value="Last Modified">
            {t("Last Modified")}
          </Select.Option>
        </StyledSelect>
      </Wrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  color: rgba(0, 0, 0, 0.45);
`;

const StyledSelect = styled(Select)`
  width: 160px;
`;

const StyledSearch = styled(Search)`
  width: 264px;
`;

export default ProjectHeader;
