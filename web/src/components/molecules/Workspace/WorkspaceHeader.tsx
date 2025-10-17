import styled from "@emotion/styled";
import { useMemo } from "react";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { SortBy, SortOption } from "./types";

type Props = {
  onProjectSearch: (value: string) => void;
  onProjectSort: (sort: SortBy) => void;
};

const WorkspaceHeader: React.FC<Props> = ({ onProjectSearch, onProjectSort }) => {
  const t = useT();

  const projectSortOptions: SortOption[] = useMemo(
    () => [
      { key: "updatedAt", label: t("Last Modified") },
      { key: "createdAt", label: t("Created At") },
      { key: "name", label: t("Name") },
    ],
    [t],
  );

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
        <StyledSelect
          defaultValue="updatedAt"
          onChange={value => {
            onProjectSort(value as SortBy);
          }}>
          {projectSortOptions.map(option => (
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
  padding: 24px 24px 0 24px;
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
