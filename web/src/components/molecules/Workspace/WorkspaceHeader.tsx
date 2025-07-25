import styled from "@emotion/styled";
import { useMemo } from "react";

import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import {
  ProjectSortOption,
  SortProjectBy,
} from "@reearth-cms/components/organisms/Workspace/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  onProjectSearch: (value: string) => void;
  onProjectSort: (sort: SortProjectBy) => void;
};

const WorkspaceHeader: React.FC<Props> = ({ onProjectSearch, onProjectSort }) => {
  const t = useT();

  const projectSortOptions: ProjectSortOption[] = useMemo(
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
            onProjectSort(value as SortProjectBy);
          }}>
          {projectSortOptions.map(option => (
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

export default WorkspaceHeader;
