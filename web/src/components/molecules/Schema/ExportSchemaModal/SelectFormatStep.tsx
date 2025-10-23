import { useMemo } from "react";

import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";

import { FormType } from ".";

type Props = {
  form: FormInstance<FormType>;
  initialValues?: FormType;
};

const SelectFormatStep: React.FC<Props> = ({ form, initialValues }) => {
  const t = useT();
  const formats = useMemo(
    () => [
      { key: "csv", label: t("CSV") },
      { key: "json", label: t("JSON") },
      { key: "geojson", label: t("GeoJSON") },
      { key: "schema", label: t("Schema") },
    ],
    [t],
  );

  return (
    <Form form={form} initialValues={initialValues} layout="vertical" autoComplete="off">
      <Form.Item
        name="format"
        label={t("File type")}
        extra={t(
          "If a Geometry field is included, it is recommended to export as GeoJSON format.",
        )}>
        <Select>
          {formats?.map(format => (
            <Select.Option key={format.key} value={format.key}>
              {format.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default SelectFormatStep;
