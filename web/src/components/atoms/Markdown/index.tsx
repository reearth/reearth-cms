import styled from "@emotion/styled";
import { useRef, useState, FocusEvent, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { runes } from "runes2";

import TextArea, { TextAreaProps } from "@reearth-cms/components/atoms/TextArea";

type Props = {
  onChange?: (value: string) => void;
  isError?: boolean;
} & TextAreaProps;

const MarkdownInput: React.FC<Props> = ({ value, onChange, ...props }) => {
  const [showMD, setShowMD] = useState(true);
  const textareaRef = useRef<HTMLInputElement>(null);
  const isError = useMemo(() => {
    if (props.isError || (props.required && !value)) {
      return true;
    } else if (props.maxLength && typeof value === "string" && value) {
      return runes(value).length > props.maxLength;
    } else {
      return false;
    }
  }, [props, value]);

  const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    setShowMD(true);
  }, []);

  const handleClick = useCallback(() => {
    if (props.disabled) return;
    setShowMD(false);
    if (textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      });
    }
  }, [props.disabled]);

  return (
    <MarkdownWrapper>
      <TextArea
        {...props}
        onChange={e => onChange?.(e)}
        onBlur={handleBlur}
        value={value}
        rows={6}
        hidden={showMD}
        ref={textareaRef}
        showCount
      />
      <StyledMD disabled={props.disabled} isError={isError} hidden={!showMD} onClick={handleClick}>
        <ReactMarkdown>{typeof value === "string" ? value : undefined}</ReactMarkdown>
      </StyledMD>
    </MarkdownWrapper>
  );
};

export default MarkdownInput;

const MarkdownWrapper = styled.div`
  width: 100%;
`;

const StyledMD = styled.div<{ disabled?: boolean; isError: boolean }>`
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  border: 1px solid #d9d9d9;
  padding: 4px 11px;
  overflow: auto;
  resize: vertical;
  height: 100%;
  width: 100% !important;
  height: 142px;
  line-height: 1;
  word-break: break-all;
  ${({ isError }) => isError && "border-color: #ff4d4f"};
  &:hover,
  &:focus {
    border-color: ${({ disabled, isError }) =>
      disabled ? "#d9d9d9" : isError ? "#ffa39e" : "#40a9ff"};
  }
  background-color: ${({ disabled }) => (disabled ? "#f5f5f5" : "#FFF")};
  * {
    ${({ isError }) => isError && "color: #ff4d4f"};
  }
`;
