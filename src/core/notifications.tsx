import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

type NotifyOptions = {
  message: string;
  title?: string;
  autoClose?: number | boolean;
};

function show({
  message,
  title,
  color,
  icon,
  autoClose = 4000,
}: NotifyOptions & {
  color: string;
  icon: React.ReactNode;
}) {
  notifications.show({
    id: message,
    title,
    message,
    color,
    icon,
    autoClose,
    withCloseButton: true,
    withBorder: true,
  });
}

export function showSuccess(message: string, title = "Success", autoClose?: number | boolean) {
  show({ message, title, color: "green", icon: <IconCheck size={18} />, autoClose });
}

export function showError(message: string, title = "Error", autoClose?: number | boolean) {
  show({ message, title, color: "red", icon: <IconX size={18} />, autoClose: autoClose ?? 6000 });
}

export function showWarning(message: string, title = "Warning", autoClose?: number | boolean) {
  show({ message, title, color: "orange", icon: <IconAlertTriangle size={18} />, autoClose });
}

export function showInfo(message: string, title = "Info", autoClose?: number | boolean) {
  show({ message, title, color: "blue", icon: <IconInfoCircle size={18} />, autoClose });
}
