import styled from "@emotion/styled";
import { useRef, useState, FocusEvent } from "react";
import ReactMarkdown from "react-markdown";

import TextArea, { TextAreaProps } from "@reearth-cms/components/atoms/TextArea";

type Props = {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
} & TextAreaProps;

const MarkdownInput: React.FC<Props> = ({ className, value = "", onChange, ...props }) => {
  const [showMD, setShowMD] = useState(true);
  const textareaRef = useRef<HTMLInputElement>(null);

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();
    setShowMD(true);
  };

  return (
    <MarkdownWrapper className={className}>
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
      <StyledMD
        hidden={!showMD}
        onClick={() => {
          setShowMD(false);
          if (textareaRef.current) {
            setTimeout(() => {
              textareaRef.current?.focus();
            });
          }
        }}>
        <ReactMarkdown>{value}</ReactMarkdown>
      </StyledMD>
    </MarkdownWrapper>
  );
};

export default MarkdownInput;

const MarkdownWrapper = styled.div`
  width: 100%;
`;

const StyledMD = styled.div`
  cursor: pointer;
  border: 1px solid #d9d9d9;
  padding: 4px 11px;
  overflow: auto;
  resize: vertical;
  height: 100%;
  width: 100% !important;
  height: 142px;
  line-height: 1;
  &:hover,
  &:focus {
    border-color: #40a9ff;
  }
`;
