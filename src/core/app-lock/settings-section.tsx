"use client";

import { useState, useCallback } from "react";
import {
  Paper,
  Text,
  Switch,
  SegmentedControl,
  Stack,
  Group,
  Button,
  Modal,
  PinInput,
  Alert,
} from "@mantine/core";
import { IconLock, IconShieldLock, IconInfoCircle } from "@tabler/icons-react";
import {
  STORAGE_KEYS,
  TIMEOUT_OPTIONS,
  MIN_PIN_LENGTH,
  hashPin,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from "./utils";
import { useAppLockStore } from "./store";

export function AppLockSettingsSection() {
  const enabled = useAppLockStore((s) => s.enabled);
  const timeoutMin = useAppLockStore((s) => s.timeoutMin);
  const setEnabled = useAppLockStore((s) => s.setEnabled);
  const setTimeoutMin = useAppLockStore((s) => s.setTimeoutMin);

  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);

  const hasPin = loadFromStorage(STORAGE_KEYS.pin, "") !== "";

  const handleToggle = useCallback(
    (checked: boolean) => {
      if (checked && !hasPin) {
        setChangeModalOpen(true);
      } else if (!checked) {
        setEnabled(false);
        removeFromStorage(STORAGE_KEYS.pin);
      } else {
        setEnabled(true);
      }
    },
    [hasPin, setEnabled],
  );

  return (
    <>
      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <Group>
            <IconShieldLock size={20} className="text-gray-500" />
            <div className="flex-1">
              <Text fw={500}>App Lock</Text>
              <Text size="sm" c="dimmed">
                Lock the app behind a numeric PIN for privacy
              </Text>
            </div>
            <Switch
              checked={enabled}
              onChange={(e) => handleToggle(e.currentTarget.checked)}
            />
          </Group>

          {enabled && (
            <>
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Auto-lock after inactivity
                </Text>
                <SegmentedControl
                  value={String(timeoutMin)}
                  onChange={(v) => setTimeoutMin(Number(v))}
                  data={TIMEOUT_OPTIONS.map((t) => ({
                    label: t === 1 ? "1 min" : `${t} min`,
                    value: String(t),
                  }))}
                  size="xs"
                />
              </div>

              <Group>
                <Button
                  variant="outline"
                  size="xs"
                  leftSection={<IconLock size={14} />}
                  onClick={() => setChangeModalOpen(true)}
                >
                  {hasPin ? "Change PIN" : "Set PIN"}
                </Button>
                {hasPin && (
                  <Button
                    variant="outline"
                    size="xs"
                    color="red"
                    onClick={() => setRemoveModalOpen(true)}
                  >
                    Remove PIN
                  </Button>
                )}
              </Group>

              <Alert
                icon={<IconInfoCircle size={14} />}
                color="gray"
                variant="light"
                p="xs"
              >
                <Text size="xs" c="dimmed">
                  Your PIN is stored locally on this device only. It is never
                  sent to the server.
                </Text>
              </Alert>
            </>
          )}
        </Stack>
      </Paper>

      <ChangePinModal
        opened={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
      />
      <RemovePinModal
        opened={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
      />
    </>
  );
}

function ChangePinModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"new" | "confirm">("new");
  const [error, setError] = useState("");

  const handleNewComplete = useCallback((value: string) => {
    setNewPin(value);
    setStep("confirm");
    setError("");
  }, []);

  const handleConfirmComplete = useCallback(
    async (value: string) => {
      if (value !== newPin) {
        setError("PINs don't match");
        setConfirmPin("");
        return;
      }
      const hashed = await hashPin(value);
      saveToStorage(STORAGE_KEYS.pin, hashed);
      saveToStorage(STORAGE_KEYS.enabled, true);
      useAppLockStore.getState().setEnabled(true);
      setNewPin("");
      setConfirmPin("");
      setStep("new");
      onClose();
    },
    [newPin, onClose],
  );

  const handleClose = useCallback(() => {
    setNewPin("");
    setConfirmPin("");
    setStep("new");
    setError("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={step === "new" ? "Set new PIN" : "Confirm new PIN"}
      size="sm"
    >
      <Stack gap="md" align="center">
        <Text size="sm" c="dimmed">
          {step === "new"
            ? `Enter a ${MIN_PIN_LENGTH}-digit numeric PIN`
            : "Enter the same PIN again to confirm"}
        </Text>
        <PinInput
          length={MIN_PIN_LENGTH}
          type="number"
          value={step === "new" ? newPin : confirmPin}
          onChange={(val) => {
            if (step === "new") {
              setNewPin(val);
              if (val.length === MIN_PIN_LENGTH) {
                handleNewComplete(val);
              }
            } else {
              setConfirmPin(val);
              if (val.length === MIN_PIN_LENGTH) {
                handleConfirmComplete(val);
              }
            }
          }}
          oneTimeCode
          autoFocus
        />
        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}

function RemovePinModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleComplete = useCallback(
    async (value: string) => {
      const stored = loadFromStorage(STORAGE_KEYS.pin, "");
      const hashed = await hashPin(value);
      if (hashed !== stored) {
        setError("Wrong PIN");
        setPin("");
        return;
      }
      removeFromStorage(STORAGE_KEYS.pin);
      saveToStorage(STORAGE_KEYS.enabled, false);
      useAppLockStore.getState().setEnabled(false);
      setPin("");
      onClose();
    },
    [onClose],
  );

  const handleClose = useCallback(() => {
    setPin("");
    setError("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Remove PIN"
      size="sm"
    >
      <Stack gap="md" align="center">
        <Text size="sm" c="dimmed">
          Enter your current PIN to remove it
        </Text>
        <PinInput
          length={MIN_PIN_LENGTH}
          type="number"
          value={pin}
          onChange={(val) => {
            setPin(val);
            if (val.length === MIN_PIN_LENGTH) {
              handleComplete(val);
            }
          }}
          oneTimeCode
          autoFocus
        />
        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
