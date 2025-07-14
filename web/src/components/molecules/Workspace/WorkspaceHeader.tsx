import styled from "@emotion/styled";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onProjectSearch: (value: string) => void;
};

const WorkspaceHeader: React.FC<Props> = ({ onProjectSearch }) => {
  const t = useT();

  return (
    <Container>
      <StyledSearch
        onSearch={onProjectSearch}
        placeholder={t("search projects")}
        allowClear
        type="text"
      />
      <Wrapper>
        <Label>{t("Sort by")}</Label>
        <StyledSelect defaultValue="Last Modified">
          <Select.Option key="updatedAt" value="Last Modified">
            Last Modified
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

export default WorkspaceHeader;
