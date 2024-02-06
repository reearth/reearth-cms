import styled from "@emotion/styled";
import moment from "moment";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Switch from "@reearth-cms/components/atoms/Switch";
import Tag from "@reearth-cms/components/atoms/Tag";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";
import { dateTimeFormat, transformMomentToString } from "@reearth-cms/utils/format";

export const itemFormat = (
  item: string,
  field: Field,
  update?: (value: string | boolean, index?: number) => void,
  index?: number,
) => {
  switch (field.type) {
    case "Text":
      return update ? (
        <StyledInput
          defaultValue={item}
          placeholder="-"
          onBlur={e => {
            update(e.target.value, index);
          }}
        />
      ) : (
        item
      );
    case "MarkdownText":
      return (
        <ReactMarkdown
          components={{
            a(props) {
              const { node: _, ...rest } = props;
              return <a target="_blank" {...rest} />;
            },
          }}
          remarkPlugins={[remarkGfm]}>
          {item}
        </ReactMarkdown>
      );
    case "Date":
      return update ? (
        <StyledDatePicker
          placeholder="-"
          defaultValue={item ? moment(item) : undefined}
          suffixIcon={undefined}
          onChange={date => {
            update(date ? transformMomentToString(date) : "", index);
          }}
        />
      ) : (
        dateTimeFormat(item)
      );
    case "Bool":
      return update ? (
        <Switch
          checkedChildren={<Icon icon={"check"} />}
          unCheckedChildren={<Icon icon={"close"} />}
          defaultChecked={item === "true"}
          onChange={checked => {
            update(checked, index);
          }}
        />
      ) : (
        <Switch
          checkedChildren={<Icon icon={"check"} />}
          unCheckedChildren={<Icon icon={"close"} />}
          checked={item === "true"}
        />
      );
    case "Asset":
      return (
        <AssetValue>
          <Icon icon={fieldTypes.Asset.icon} size={18} />
          {item}
        </AssetValue>
      );
    case "URL":
      return (
        <a href={item} target="_blank" rel="noreferrer">
          {item}
        </a>
      );
    case "Reference":
      return (
        <StyledTag icon={<StyledIcon icon={fieldTypes.Reference.icon} size={14} />}>
          {item}
        </StyledTag>
      );
    case "Checkbox":
      return update ? (
        <Checkbox
          defaultChecked={item === "true"}
          onChange={e => {
            update(e.target.checked, index);
          }}
        />
      ) : (
        <Checkbox checked={item === "true"} />
      );
    default:
      return item;
  }
};

const AssetValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledTag = styled(Tag)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const StyledIcon = styled(Icon)`
  height: 14px;
`;

const StyledInput = styled(Input)`
  border-color: transparent;
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  input {
    cursor: pointer;
  }
  :hover {
    border-color: transparent;
  }
  :focus {
    cursor: text;
    border-color: #40a9ff;
    ::placeholder {
      color: transparent;
    }
  }
  ::placeholder {
    color: inherit;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  border-color: transparent;
  cursor: pointer;
  padding-left: 0;
  padding-right: 0;
  input {
    cursor: pointer;
    :focus {
      cursor: text;
      ::placeholder {
        color: transparent;
      }
    }
    ::placeholder {
      color: inherit;
    }
  }
  :hover {
    border-color: transparent;
  }
  &.ant-picker-focused {
    border-color: #40a9ff;
  }
`;
