import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import type { ObjectSupportedType } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { GeometryKind, GeoUtils } from "@reearth-cms/utils/geoUtils";

import { collectionToText, readFieldValue } from "./core/fieldValue";
import type { FieldValue, StoredValue } from "./core/fieldValue";
import EditorModal from "./EditorModal";
import FieldPreview from "./FieldPreview";

const KIND_BY_SUPPORTED_TYPE: Record<ObjectSupportedType, GeometryKind> = {
  POINT: GeometryKind.POINT,
  MULTIPOINT: GeometryKind.MULTI_POINT,
  LINESTRING: GeometryKind.LINE_STRING,
  MULTILINESTRING: GeometryKind.MULTI_LINE_STRING,
  POLYGON: GeometryKind.POLYGON,
  MULTIPOLYGON: GeometryKind.MULTI_POLYGON,
  GEOMETRYCOLLECTION: GeometryKind.GEOMETRY_COLLECTION,
};

type Props = {
  /** Injected by antd Form.Item: a GeoJSON geometry, or a list of them when `multiple`. */
  value?: StoredValue;
  onChange?: (value: FieldValue) => void;
  title: string;
  multiple: boolean;
  /** Legacy Geometry Object restriction; omitted means every GeoJSON geometry type. */
  supportedTypes?: ObjectSupportedType[];
  disabled?: boolean;
  onValidityChange?: (valid: boolean) => void;
};

/**
 * Unified Geometry field: one compact map in the form, one full-screen editor for drawing,
 * coordinates, search and GeoJSON.
 */
const GeometryEditorV2: React.FC<Props> = ({
  value,
  onChange,
  title,
  multiple,
  supportedTypes,
  disabled = false,
  onValidityChange,
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);

  const allowedKinds = useMemo(
    () =>
      supportedTypes?.length
        ? supportedTypes.map(type => KIND_BY_SUPPORTED_TYPE[type])
        : [...GeoUtils.ALL_KINDS],
    [supportedTypes],
  );

  const read = useMemo(
    () => readFieldValue(value, multiple, { allowedKinds }),
    [allowedKinds, multiple, value],
  );

  useEffect(() => onValidityChange?.(read.ok), [onValidityChange, read.ok]);

  const handleCopy = useCallback(() => {
    const text = read.ok ? collectionToText(read.collection, multiple) : read.text;
    void navigator.clipboard
      ?.writeText(text)
      .then(() => Notification.success({ message: t("Value copied!!") }));
  }, [multiple, read, t]);

  return (
    <>
      <FieldPreview
        collection={read.ok ? read.collection : { type: "FeatureCollection", features: [] }}
        issues={read.ok ? [] : read.issues}
        disabled={disabled}
        onOpen={() => setOpen(true)}
        onCopy={handleCopy}
        onClear={() => onChange?.(multiple ? [] : null)}
      />
      <EditorModal
        open={open}
        title={title}
        multiple={multiple}
        readOnly={disabled}
        allowedKinds={allowedKinds}
        value={value}
        onApply={next => onChange?.(next)}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default GeometryEditorV2;
