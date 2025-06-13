import styled from "@emotion/styled";
import { useState } from "react";

import CopyButton from "@reearth-cms/components/atoms/CopyButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Password from "@reearth-cms/components/atoms/Password";

type Props = {
  apiKey: string;
};

const KeyCell: React.FC<Props> = ({ apiKey }) => {
  const [visible, setVisible] = useState(false);

  return (
    <StyledTokenInput
      data-testid="key"
      value={apiKey}
      disabled
      visibilityToggle={{ visible }}
      iconRender={() => <CopyButton copyable={{ text: apiKey }} />}
      prefix={
        <Icon
          icon={visible ? "eye" : "eyeInvisible"}
          onClick={() => {
            setVisible(prev => !prev);
          }}
        />
      }
    />
  );
};

const maxWidth = "500px";

const StyledTokenInput = styled(Password)`
  max-width: ${maxWidth};
  border: none;

  &.ant-input-affix-wrapper-disabled {
    background-color: transparent !important;
    cursor: text;
    color: #000000e0;

    input[disabled] {
      cursor: text;
    }
  }

  .ant-input-prefix {
    order: 1;
    margin-left: 4px;
    color: #00000073;
    transition: all 0.3s;

    &:hover {
      color: #000000e0;
    }
  }

  .ant-input-suffix {
    order: 2;
  }
`;

export default KeyCell;
