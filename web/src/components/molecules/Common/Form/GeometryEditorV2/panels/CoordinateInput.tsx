import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  onCommit: (value: number) => void;
};

/**
 * Enter or blur applies, Esc reverts.
 */
const CoordinateInput: React.FC<Props> = ({ label, value, min, max, disabled, onCommit }) => {
  const t = useT();
  const [draft, setDraft] = useState<number | null>(value);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(value);
  }, [value]);

  const valid = useMemo<boolean>(
    () => draft !== null && Number.isFinite(draft) && draft >= min && draft <= max,
    [draft, max, min],
  );

  const apply = useCallback<() => void>(() => {
    if (valid && draft && draft !== value) onCommit(draft);
    if (!valid) setDraft(value);
  }, [draft, onCommit, valid, value]);

  return (
    <Field>
      <SmallText type="secondary">{label}</SmallText>
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
        <SmallText type="danger">
          {t("Enter a number between {{min}} and {{max}}", { min, max })}
        </SmallText>
      )}
    </Field>
  );
};

export default CoordinateInput;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const SmallText = styled(Typography.Text)`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
`;
