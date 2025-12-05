import styled from "@emotion/styled";
import { useMemo } from "react";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { SortBy, SortOption } from "../Workspace/types";

type Props = {
  onModelSearch: (value: string) => void;
  onModelSort: (sort: SortBy) => void;
};

const ProjectHeader: React.FC<Props> = ({ onModelSearch, onModelSort }) => {
  const t = useT();

  const modelSortOptions: SortOption[] = useMemo(
    () => [
      { key: "updatedat", label: t("Last Modified") },
      { key: "id", label: t("Created At") },
      { key: "name", label: t("Name") },
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
            onModelSort(value as SortBy);
          }}>
          {modelSortOptions.map(option => (
            <Select.Option key={option.key} value={option.key}>
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
