import { CheckboxChangeEvent } from "antd/lib/checkbox";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import Form from "@reearth-cms/components/atoms/Form";
import {
  keyAutoFill,
  keyReplace,
  emptyConvert,
} from "@reearth-cms/components/molecules/Common/Form/utils";
import {
  Field,
  FieldModalTabs,
  FieldType,
  FormValues,
  FormTypes,
  ObjectSupportedType,
  EditorSupportedType,
  SelectedSchemaType,
} from "@reearth-cms/components/molecules/Schema/types";
import { transformDayjsToString } from "@reearth-cms/utils/format";
import { validateKey } from "@reearth-cms/utils/regex";

export default (
  selectedSchemaType: SelectedSchemaType,
  selectedType: FieldType,
  isMeta: boolean,
  selectedField: Field | null,
  open: boolean,
  onClose: () => void,
  onSubmit: (values: FormValues) => Promise<void>,
  handleFieldKeyUnique: (key: string) => boolean,
) => {
  const [form] = Form.useForm<FormTypes>();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [activeTab, setActiveTab] = useState<FieldModalTabs>("settings");
  const selectedValues = Form.useWatch("values", form);
  const selectedTags = Form.useWatch("tags", form);
  const selectedSupportedTypes = Form.useWatch<ObjectSupportedType[] | EditorSupportedType>(
    "supportedTypes",
    form,
  );
  const maxLength = Form.useWatch("maxLength", form);
  const min = Form.useWatch("min", form);
  const max = Form.useWatch("max", form);
  const [multipleValue, setMultipleValue] = useState(false);
  const prevKey = useRef<{ key: string; isSuccess: boolean }>();

  const handleMultipleChange = useCallback(
    (e: CheckboxChangeEvent) => {
      const defaultValue = form.getFieldValue("defaultValue");
      if (e.target.checked) {
        form.setFieldValue("defaultValue", defaultValue && [defaultValue]);
      } else {
        form.setFieldValue("defaultValue", defaultValue?.[0]);
      }
      setMultipleValue(e.target.checked);
    },
    [form],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as FieldModalTabs);
    },
    [setActiveTab],
  );

  useEffect(() => {
    if (selectedType === "Select") {
      const defaultValue = form.getFieldValue("defaultValue");
      if (Array.isArray(defaultValue)) {
        const filteredValue = defaultValue.filter(value => selectedValues?.includes(value));
        form.setFieldValue("defaultValue", filteredValue);
      } else if (!selectedValues?.includes(defaultValue)) {
        form.setFieldValue("defaultValue", undefined);
      }
    }
  }, [form, selectedValues, selectedType]);

  useEffect(() => {
    if (selectedType === "Tag") {
      const defaultValue = form.getFieldValue("defaultValue");
      if (Array.isArray(defaultValue)) {
        const filteredValue = defaultValue.filter(value =>
          selectedTags?.some(tag => tag.name === value),
        );
        form.setFieldValue("defaultValue", filteredValue);
      } else if (!selectedTags?.some(tag => tag.name === defaultValue)) {
        form.setFieldValue("defaultValue", undefined);
      }
    }
  }, [form, selectedTags, selectedType]);

  const defaultValueGet = useCallback((selectedField: Field) => {
    const defaultValue = selectedField.typeProperty?.defaultValue;
    const selectDefaultValue = selectedField.typeProperty?.selectDefaultValue;
    if (selectedField.type === "Date") {
      if (Array.isArray(defaultValue)) {
        return defaultValue.map(valueItem => dayjs(valueItem as string));
      } else {
        return defaultValue && dayjs(defaultValue as string);
      }
    } else if (selectedField.type === "Tag") {
      if (Array.isArray(selectDefaultValue)) {
        return selectDefaultValue.map(
          valueItem =>
            selectedField.typeProperty?.tags?.find(
              (tag: { id: string; name: string }) => tag.id === valueItem,
            )?.name,
        );
      } else {
        return selectedField.typeProperty?.tags?.find(
          (tag: { id: string; name: string }) => tag.id === selectDefaultValue,
        )?.name;
      }
    } else {
      return (
        defaultValue ??
        selectDefaultValue ??
        selectedField.typeProperty?.integerDefaultValue ??
        selectedField.typeProperty?.assetDefaultValue
      );
    }
  }, []);

  const changedKeys = useRef(new Set<string>());
  const defaultValueRef = useRef<Partial<FormTypes>>();

  useEffect(() => {
    setMultipleValue(!!selectedField?.multiple);
    const defaultValue = {
      fieldId: selectedField?.id,
      title: selectedField?.title,
      description: selectedField?.description,
      key: selectedField?.key,
      multiple: !!selectedField?.multiple,
      unique: !!selectedField?.unique,
      isTitle: !!selectedField?.isTitle,
      required: !!selectedField?.required,
      defaultValue: selectedField ? defaultValueGet(selectedField) : undefined,
      min: selectedField?.typeProperty?.min ?? selectedField?.typeProperty?.numberMin,
      max: selectedField?.typeProperty?.max ?? selectedField?.typeProperty?.numberMax,
      maxLength: selectedField?.typeProperty?.maxLength,
      values: selectedField?.typeProperty?.values,
      tags: selectedField?.typeProperty?.tags,
      group: selectedField?.typeProperty?.groupId,
      supportedTypes:
        selectedField?.typeProperty?.objectSupportedTypes ||
        selectedField?.typeProperty?.editorSupportedTypes?.[0],
    };
    form.setFieldsValue(defaultValue);
    defaultValueRef.current = defaultValue;
    changedKeys.current.clear();
  }, [defaultValueGet, form, selectedField]);

  const typePropertyGet = useCallback((values: FormTypes) => {
    switch (values.type) {
      case "TextArea":
        return {
          textArea: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
      case "MarkdownText":
        return {
          markdownText: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
      case "Asset":
        return {
          asset: { defaultValue: values.defaultValue },
        };
      case "Select": {
        const defaultValue = Array.isArray(values.defaultValue)
          ? values.defaultValue.filter((value: string) => value)
          : (values.defaultValue ?? "");
        return {
          select: { defaultValue, values: values.values ?? [] },
        };
      }
      case "Integer":
      case "Number": {
        const defaultValue = Array.isArray(values.defaultValue)
          ? values.defaultValue.filter((value: number | string) => typeof value === "number")
          : (values.defaultValue ?? "");
        return {
          [values.type === "Integer" ? "integer" : "number"]: {
            defaultValue,
            min: values.min ?? null,
            max: values.max ?? null,
          },
        };
      }
      case "Bool":
        return {
          bool: { defaultValue: values.defaultValue },
        };
      case "Date":
        return {
          date: { defaultValue: transformDayjsToString(values.defaultValue) ?? "" },
        };
      case "Tag": {
        const defaultValue =
          Array.isArray(values.defaultValue) && values.defaultValue.length
            ? values.tags
                ?.filter(tag => values.defaultValue.includes(tag.name))
                .map(({ name }) => name)
            : values.defaultValue;
        return {
          tag: {
            defaultValue,
            tags: values.tags ?? [],
          },
        };
      }
      case "Checkbox":
        return {
          checkbox: { defaultValue: values.defaultValue },
        };
      case "URL":
        return {
          url: { defaultValue: values.defaultValue },
        };
      case "Group":
        return {
          group: { groupId: values.group },
        };
      case "GeometryObject":
        return {
          geometryObject: {
            defaultValue: values.defaultValue,
            supportedTypes: values.supportedTypes,
          },
        };
      case "GeometryEditor":
        return {
          geometryEditor: {
            defaultValue: values.defaultValue,
            supportedTypes: [values.supportedTypes],
          },
        };
      case "Text":
      default:
        return {
          text: { defaultValue: values.defaultValue, maxLength: values.maxLength },
        };
    }
  }, []);

  const values = Form.useWatch([], form);
  useEffect(() => {
    if (form.getFieldValue("title") && form.getFieldValue("key")) {
      if (
        form.getFieldValue("values")?.length === 0 ||
        form.getFieldValue("group")?.length === 0 ||
        form.getFieldValue("supportedTypes")?.length === 0 ||
        form.getFieldValue("tags")?.length === 0
      ) {
        setButtonDisabled(true);
      } else {
        form
          .validateFields()
          .then(() => setButtonDisabled(changedKeys.current.size === 0))
          .catch(() => setButtonDisabled(true));
      }
    } else {
      setButtonDisabled(true);
    }
  }, [form, values]);

  const handleValuesChange = useCallback(async (changedValues: Record<string, unknown>) => {
    const [key, value] = Object.entries(changedValues)[0] as [keyof FormTypes, unknown];
    let changedValue = value;
    let defaultValue = defaultValueRef.current?.[key];
    if (key === "supportedTypes" && Array.isArray(value) && Array.isArray(defaultValue)) {
      changedValue = [...value].sort();
      defaultValue = [...defaultValue].sort();
    }
    if (JSON.stringify(emptyConvert(changedValue)) === JSON.stringify(emptyConvert(defaultValue))) {
      changedKeys.current.delete(key);
    } else {
      changedKeys.current.add(key);
    }
  }, []);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedField) return;
      keyAutoFill(e, { form, key: "key" });
    },
    [selectedField, form],
  );

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      keyReplace(e, { form, key: "key" });
    },
    [form],
  );

  const handleModalReset = useCallback(() => {
    prevKey.current = undefined;
    form.resetFields();
    setActiveTab("settings");
    setMultipleValue(false);
    onClose();
  }, [form, onClose]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    values.type = selectedType;
    values.typeProperty = typePropertyGet(values);
    values.metadata = isMeta;
    try {
      await onSubmit({
        ...values,
        fieldId: selectedField?.id,
      });
      handleModalReset();
    } catch (error) {
      console.error(error);
    }
  }, [form, selectedType, typePropertyGet, isMeta, onSubmit, selectedField?.id, handleModalReset]);

  const isRequiredDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  const isUniqueDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  const keyValidate = useCallback(
    (value: string) => {
      if (prevKey.current?.key === value) {
        return prevKey.current?.isSuccess ? Promise.resolve() : Promise.reject();
      } else if (validateKey(value) && handleFieldKeyUnique(value)) {
        prevKey.current = { key: value, isSuccess: true };
        return Promise.resolve();
      } else {
        prevKey.current = { key: value, isSuccess: false };
        return Promise.reject();
      }
    },
    [handleFieldKeyUnique],
  );

  const isTitleDisabled = useMemo(
    () =>
      (selectedSchemaType === "model" && isMeta) ||
      !(selectedType === "Text" || selectedType === "TextArea" || selectedType === "MarkdownText"),
    [isMeta, selectedSchemaType, selectedType],
  );

  const ObjectSupportType = useMemo(
    () => [
      { label: "Point", value: "POINT" },
      { label: "Linestring", value: "LINESTRING" },
      { label: "Polygon", value: "POLYGON" },
      { label: "GeometryCollection", value: "GEOMETRYCOLLECTION" },
      { label: "MultiPoint", value: "MULTIPOINT" },
      { label: "MultiLinestring", value: "MULTILINESTRING" },
      { label: "MultiPolygon", value: "MULTIPOLYGON" },
    ],
    [],
  );

  const EditorSupportType = useMemo(
    () => [
      { label: "Point", value: "POINT" },
      { label: "Linestring", value: "LINESTRING" },
      { label: "Polygon", value: "POLYGON" },
      { label: "Any", value: "ANY" },
    ],
    [],
  );

  useEffect(() => {
    if (open && !selectedField) {
      if (selectedType === "Select") {
        form.setFieldValue("values", []);
      } else if (selectedType === "Group") {
        form.setFieldValue("group", "");
      } else if (selectedType === "GeometryObject") {
        form.setFieldValue("supportedTypes", []);
      } else if (selectedType === "GeometryEditor") {
        form.setFieldValue("supportedTypes", EditorSupportType[0].value);
      } else if (selectedType === "Tag") {
        form.setFieldValue("tags", []);
      }
    }
  }, [EditorSupportType, form, open, selectedField, selectedType]);

  const [emptyIndexes, setEmptyIndexes] = useState<number[]>([]);
  const emptyValidator = useCallback(async (values?: string[]) => {
    if (values) {
      const indexes = values
        .map((value: string, index: number) => value.length === 0 && index)
        .filter(value => typeof value === "number");
      setEmptyIndexes(indexes);
      if (indexes.length) {
        return Promise.reject();
      }
    }
  }, []);

  const [duplicatedIndexes, setDuplicatedIndexes] = useState<number[]>([]);
  const duplicatedValidator = useCallback(async (values?: string[]) => {
    if (values) {
      const indexes = values
        .map((value: string, selfIndex: number) => {
          if (!value) return;
          const index = values.findIndex(v => v === value);
          return index < selfIndex && selfIndex;
        })
        .filter(value => typeof value === "number");
      setDuplicatedIndexes(indexes);
      if (indexes.length) {
        return Promise.reject();
      }
    }
  }, []);

  const errorIndexes = useMemo(
    () => new Set([...emptyIndexes, ...duplicatedIndexes]),
    [duplicatedIndexes, emptyIndexes],
  );

  return {
    form,
    buttonDisabled,
    activeTab,
    selectedValues,
    selectedTags,
    selectedSupportedTypes,
    maxLength,
    min,
    max,
    multipleValue,
    handleMultipleChange,
    handleTabChange,
    handleValuesChange,
    handleNameChange,
    handleKeyChange,
    handleSubmit,
    handleModalReset,
    isRequiredDisabled,
    isUniqueDisabled,
    keyValidate,
    isTitleDisabled,
    ObjectSupportType,
    EditorSupportType,
    emptyValidator,
    duplicatedValidator,
    errorIndexes,
  };
};
