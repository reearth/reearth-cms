import styled from "@emotion/styled";
import { useMemo } from "react";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import { ModelSortOption, SortModelBy } from "@reearth-cms/components/organisms/Project/Overview/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onModelSearch: (value: string) => void;
  onModelSort: (sort: SortModelBy) => void;
};

const ProjectHeader: React.FC<Props> = ({ onModelSearch, onModelSort }) => {
  const t = useT();

  const modelSortOptions: ModelSortOption[] = useMemo(
    () => [
      { key: "updatedAt", value: "updatedAt", label: t("Last Modified") },
      { key: "createdAt", value: "createdAt", label: t("Created At") },
      { key: "name", value: "name", label: t("Name") },
    ],
    [t],
  );

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
        <StyledSelect
          defaultValue="updatedAt"
          onChange={value => {
            onModelSort(value as SortModelBy);
          }}>
          {modelSortOptions.map(option => (
            <Select.Option key={option.key} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
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
