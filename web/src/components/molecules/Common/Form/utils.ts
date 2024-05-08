import { FormInstance } from "@reearth-cms/components/atoms/Form";

export const keyAutoFill = (
  e: React.ChangeEvent<HTMLInputElement>,
  formData: { form: FormInstance; key: string },
) => {
  const { form, key } = formData;
  const prevName = e.currentTarget.attributes[4].value.replaceAll(" ", "-");
  const currentAlias = form.getFieldValue(key);
  if (!currentAlias || currentAlias === prevName) {
    const currentName = e.currentTarget.value.replaceAll(" ", "-");
    form.setFieldValue(key, currentName);
  }
};

export const keyReplace = (
  e: React.ChangeEvent<HTMLInputElement>,
  formData: { form: FormInstance; key: string },
) => {
  const { form, key } = formData;
  form.setFieldValue(key, e.currentTarget.value.replaceAll(" ", "-"));
};
