import { notification } from "antd";

notification.config({
  duration: 2,
  props: {
    "data-testid": "notification",
  },
});

export default notification;
