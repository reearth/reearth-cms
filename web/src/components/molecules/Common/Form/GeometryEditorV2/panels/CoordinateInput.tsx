import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";

import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useT } from "@reearth-cms/i18n";
import { AntdToken } from "@reearth-cms/utils/style";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  /** Visually hide the label (vertex tables label their columns instead). */
  hideLabel?: boolean;
  onCommit: (value: number) => void;
};

/**
 * Enter or blur applies, Esc reverts.
 */
const CoordinateInput: React.FC<Props> = ({
  label,
  value,
  min,
  max,
  disabled,
  hideLabel,
  onCommit,
}) => {
  const t = useT();
  const [draft, setDraft] = useState<number | null>(value);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(value);
  }, [value]);

  const valid = draft !== null && Number.isFinite(draft) && draft >= min && draft <= max;

  const apply = () => {
    if (valid && draft !== value) onCommit(draft);
    if (!valid) setDraft(value);
  };

  return (
    <Field>
      <Typography.Text type="secondary" style={hideLabel ? HIDDEN : LABEL}>
        {label}
      </Typography.Text>
      <InputNumber<number>
        aria-label={label}
        value={draft ?? undefined}
        controls={false}
        disabled={disabled}
        status={valid ? undefined : "error"}
        size="small"
        onFocus={() => {
          focusedRef.current = true;
        }}
        onBlur={() => {
          focusedRef.current = false;
          apply();
        }}
        onChange={next => setDraft(typeof next === "number" ? next : null)}
        onPressEnter={apply}
        onKeyDown={e => {
          if (e.key === "Escape") {
            e.stopPropagation();
            setDraft(value);
          }
        }}
      />
      {!valid && (
        <Typography.Text type="danger" style={{ fontSize: AntdToken.FONT.SIZE_SM }}>
          {t("Enter a number between {{min}} and {{max}}", { min, max })}
        </Typography.Text>
      )}
    </Field>
  );
};

export default CoordinateInput;

const LABEL = { fontSize: AntdToken.FONT.SIZE_SM };
const HIDDEN = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
} as const;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;
