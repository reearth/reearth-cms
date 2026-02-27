import styled from "@emotion/styled";
import dayjs from "dayjs";
import { FocusEvent, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Notification from "@reearth-cms/components/atoms/Notification";
import Switch from "@reearth-cms/components/atoms/Switch";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, transformDayjsToString } from "@reearth-cms/utils/format";
import { validateURL } from "@reearth-cms/utils/regex";

type Props = {
  field: Field;
  index?: number;
  item: string;
  update?: (value: boolean | string, index?: number) => void;
};

export const ItemFormat: React.FC<Props> = ({ field, index, item, update }) => {
  const t = useT();

  const [isEditable, setIsEditable] = useState(false);
  const [itemState, setItemState] = useState(item);

  const handleTextBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (itemState === value) {
        return;
      }
      update?.(value, index);
      setItemState(value);
    },
    [index, itemState, update],
  );

  const handleUrlBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (itemState === value) {
        setIsEditable(false);
        return;
      }
      if (value && !validateURL(value)) {
        Notification.error({ message: t("Please input a valid URL") });
        return;
      }
      update?.(value, index);
      setItemState(value);
      setIsEditable(false);
    },
    [index, itemState, t, update],
  );

  switch (field.type) {
    case "Text":
      return update ? (
        <StyledInput
          defaultValue={item}
          maxLength={field.typeProperty?.maxLength}
          onBlur={handleTextBlur}
          placeholder="-"
        />
      ) : (
        item
      );
    case "MarkdownText":
      return (
        <ReactMarkdown
          components={{
            a(props) {
              delete props.node;
              return <a target="_blank" {...props} />;
            },
          }}
          remarkPlugins={[remarkGfm]}>
          {item}
        </ReactMarkdown>
      );
    case "Date":
      return update ? (
        <StyledDatePicker
          defaultValue={item ? dayjs(item) : undefined}
          onChange={date => {
            update(date ? transformDayjsToString(date) : "", index);
          }}
          placeholder="-"
          suffixIcon={undefined}
        />
      ) : (
        dateTimeFormat(item, "YYYY-MM-DD")
      );
    case "Bool":
      return update ? (
        <Switch
          checkedChildren={<Icon icon={"check"} />}
          defaultChecked={item === "true"}
          onChange={checked => {
            update(checked, index);
          }}
          unCheckedChildren={<Icon icon={"close"} />}
        />
      ) : (
        <ReadOnlySwitch
          checked={item === "true"}
          checkedChildren={<Icon icon={"check"} />}
          disabled
          unCheckedChildren={<Icon icon={"close"} />}
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
      return update ? (
        !itemState || isEditable ? (
          <StyledInput
            autoFocus={isEditable}
            defaultValue={itemState}
            onBlur={handleUrlBlur}
            placeholder="-"
          />
        ) : (
          <Tooltip
            arrow={false}
            color="#fff"
            overlayInnerStyle={{ transform: "translateX(-40px)" }}
            overlayStyle={{ paddingLeft: 0 }}
            placement="right"
            title={<Icon color="#1890ff" icon={"edit"} onClick={() => setIsEditable(true)} />}>
            <UrlWrapper>
              <a href={itemState} rel="noreferrer" target="_blank">
                {itemState}
              </a>
            </UrlWrapper>
          </Tooltip>
        )
      ) : (
        <a href={item} rel="noreferrer" target="_blank">
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

const ReadOnlySwitch = styled(Switch)`
  opacity: 1;
  cursor: default;

  &:disabled * {
    cursor: default !important;
  }
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

const UrlWrapper = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ItemFormat;
