import { useCallback, useRef } from "react";

import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { aliasRegex } from "@reearth-cms/utils/regex";

export default (
  onProjectAliasCheck: (alias: string) => Promise<boolean>,
  originalAlias?: string,
) => {
  const t = useT();

  const prevAliases = useRef<Map<string, boolean>>(new Map());

  const aliasValidate = useCallback(
    async (value: string) => {
      // empty value, throw error
      if (!value) return Promise.reject(t("{{field}} field is required!", { field: "alias" }));

      // equal original value, then bypass
      if (!!originalAlias && originalAlias === value) return Promise.resolve();

      // use previous validation
      if (prevAliases.current.has(value)) {
        return prevAliases.current.get(value)
          ? Promise.resolve()
          : Promise.reject(t("Project alias is already taken"));
      }

      // check length of alias in range
      if (
        value.length < Constant.PROJECT_ALIAS.MIN_LENGTH ||
        value.length > Constant.PROJECT_ALIAS.MAX_LENGTH
      ) {
        return Promise.reject(
          t(`Your alias must be between {{min}} and {{max}} characters long.`, {
            min: Constant.PROJECT_ALIAS.MIN_LENGTH,
            max: Constant.PROJECT_ALIAS.MAX_LENGTH,
          }),
        );
      }

      // check illegal characters
      if (!aliasRegex.test(value)) {
        return Promise.reject(
          t(
            "Alias is invalid. Please use lowercase alphanumeric, hyphen and underscore characters only.",
          ),
        );
      }

      // duplicate alias
      const checkResult = await onProjectAliasCheck(value);
      if (!checkResult) {
        prevAliases.current.set(value, false);
        return Promise.reject(t("Project alias is already taken"));
      }

      prevAliases.current.set(value, true);

      return Promise.resolve();
    },
    [onProjectAliasCheck, originalAlias, t],
  );

  return {
    aliasValidate,
  };
};
