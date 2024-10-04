import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { validateKey } from "@reearth-cms/utils/regex";

export const keyAutoFill = (
  e: React.ChangeEvent<HTMLInputElement>,
  formData: { form: FormInstance; key: string },
) => {
  const { form, key } = formData;
  const prevName = e.currentTarget.attributes[4].value.replaceAll(" ", "-");
  const currentAlias = form.getFieldValue(key);
  if (!currentAlias || currentAlias.toLowerCase() === prevName.toLowerCase()) {
    const currentName = e.currentTarget.value.replaceAll(" ", "-").toLowerCase();
    if (validateKey(currentName) || currentName === "") {
      form.setFieldValue(key, currentName);
    }
  }
};

export const keyReplace = (
  e: React.ChangeEvent<HTMLInputElement>,
  formData: { form: FormInstance; key: string },
) => {
  const { form, key } = formData;
  form.setFieldValue(key, e.currentTarget.value.replaceAll(" ", "-"));
};

export const emptyConvert = (value: unknown) => {
  if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
    return undefined;
  } else {
    return value;
  }
};
