import type { Meta, StoryObj } from "@storybook/react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";

const meta = {
  argTypes: {
    danger: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    type: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "link"],
    },
  },
  component: Button,
  tags: ["autodocs"],
  title: "reearth-cms/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Hello",
    danger: false,
    disabled: false,
    type: "default",
  },
};

export const IconButton: Story = {
  args: {
    children: "Hello",
    danger: false,
    disabled: false,
    icon: <Icon icon="plus" />,
    type: "default",
  },
};
