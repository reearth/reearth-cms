import styled from "@emotion/styled";
import { TextAreaProps } from "antd/lib/input";
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import TextArea from "@reearth-cms/components/atoms/TextArea";

type MarkDownInputProps = {
  value?: string;
  onChange?: (value: string) => void;
} & TextAreaProps;

const MarkDownInput: React.FC<MarkDownInputProps> = ({ value = "", onChange, ...props }) => {
  const [showMD, setShowMD] = useState(true);
  const textareaInputReference = useRef<HTMLInputElement>(null);

  return (
    <>
      <TextArea
        {...props}
        onChange={e => onChange?.(e.target.value)}
        onBlur={valueEvent => {
          valueEvent.stopPropagation();
          setShowMD(true);
        }}
        value={value}
        rows={6}
        hidden={showMD}
        ref={textareaInputReference}
        showCount
      />
      <StyledMD
        hidden={!showMD}
        onClick={() => {
          setShowMD(false);
          if (textareaInputReference.current) {
            setTimeout(() => {
              textareaInputReference.current?.focus();
            });
          }
        }}>
        <ReactMarkdown>{value}</ReactMarkdown>
      </StyledMD>
    </>
  );
};

export default MarkDownInput;

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
