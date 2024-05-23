import { FilterType } from "@reearth-cms/components/molecules/Content/Table/types";
import { TypeProperty } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";

export default (
  members?: Member[],
  column?: { type?: FilterType; typeProperty?: TypeProperty },
) => {
  if (!column) return;
  const options = [];

  if (column.type === "Select") {
    if (column.typeProperty?.values) {
      for (const value of Object.values(column.typeProperty.values)) {
        options.push({ value, label: value });
      }
    }
  } else if (column.type === "Tag") {
    if (column?.typeProperty?.tags) {
      for (const tag of Object.values(column.typeProperty.tags)) {
        options.push({ value: tag.id, label: tag.name, color: tag.color });
      }
    }
  } else if (column.type === "Person") {
    if (members?.length) {
      for (const member of Object.values(members)) {
        if ("user" in member) {
          options.push({ value: member.user?.name, label: member.user?.name });
        }
      }
    }
  } else if (column.type === "Bool" || column.type === "Checkbox") {
    options.push({ value: "true", label: "True" }, { value: "false", label: "False" });
  }

  return options;
};
