"use client";

import { Stack, Title, Text, Paper, Group, Avatar, Divider, Checkbox, Box } from "@mantine/core";
import { useUser } from "@clerk/nextjs";
import { navigation, findNavItemByFeatureId, type NavItem } from "@/core/navigation";
import { useSidebarVisibility } from "@/core/sidebar-visibility";
import { useSidebarFavorites } from "@/core/sidebar-favorites";
import { cn } from "@/core/utils";

function ItemCheckbox({ item, checked, onChange, disabled }: { item: NavItem; checked: boolean; onChange: () => void; disabled: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg px-3 py-1.5", disabled && "opacity-40")}>
      <Checkbox checked={checked} onChange={onChange} disabled={disabled} size="xs" />
      <div className="text-gray-500">
        <item.icon size={16} />
      </div>
      <Text size="sm">{item.label}</Text>
    </div>
  );
}

function ItemList({ items, hiddenItems, toggleItem, groupHidden }: { items: NavItem[]; hiddenItems: string[]; toggleItem: (id: string) => void; groupHidden: boolean }) {
  return (
    <div className="ml-5 mt-1 space-y-0.5">
      {items.map((item) => {
        if (item.children) {
          return (
            <div key={item.featureId}>
              <ItemCheckbox item={item} checked={!hiddenItems.includes(item.featureId)} onChange={() => toggleItem(item.featureId)} disabled={groupHidden} />
              <div className="ml-5 mt-0.5 space-y-0.5">
                {item.children.map((child) => (
                  <ItemCheckbox key={child.featureId} item={child} checked={!hiddenItems.includes(child.featureId)} onChange={() => toggleItem(child.featureId)} disabled={groupHidden} />
                ))}
              </div>
            </div>
          );
        }
        return (
          <ItemCheckbox key={item.featureId} item={item} checked={!hiddenItems.includes(item.featureId)} onChange={() => toggleItem(item.featureId)} disabled={groupHidden} />
        );
      })}
    </div>
  );
}

function SidebarFavoritesSection() {
  const { getDefaultFavoriteItems, getCustomFavoriteItems, toggleFavorite } =
    useSidebarFavorites();
  const defaultItems = getDefaultFavoriteItems();
  const customItems = getCustomFavoriteItems();

  return (
    <Paper withBorder p="lg" radius="md">
      <Text fw={500} mb="sm">
        Sidebar Favorites
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Default favorites always appear at the top. Star any nav item in the sidebar to add your own favorites below.
      </Text>
      <Stack gap="xs">
        {defaultItems.map((item) => (
          <div key={item.featureId} className="flex items-center gap-3 rounded-lg px-3 py-1.5">
            <div className="text-gray-500">
              <item.icon size={16} />
            </div>
            <Text size="sm" className="flex-1">
              {item.label}
            </Text>
            <Text size="xs" c="dimmed">Default</Text>
          </div>
        ))}
        {customItems.length > 0 && <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-1" />}
        {customItems.map((item) => (
          <div key={item.featureId} className="flex items-center gap-3 rounded-lg px-3 py-1.5">
            <div className="text-gray-500">
              <item.icon size={16} />
            </div>
            <Text size="sm" className="flex-1">
              {item.label}
            </Text>
            <Text
              component="button"
              size="xs"
              c="red"
              className="cursor-pointer bg-transparent border-0"
              onClick={() => toggleFavorite(item.featureId)}
            >
              Remove
            </Text>
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

function SidebarVisibilitySection() {
  const { state, toggleGroup, toggleItem } = useSidebarVisibility();

  return (
    <Paper withBorder p="lg" radius="md">
      <Text fw={500} mb="sm">
        Sidebar Menu Visibility
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Show or hide navigation items. Uncheck a group to hide all items inside it.
      </Text>
      <Stack gap="md">
        {navigation.map((group) => {
          if (group.label === "System" || group.label === "Favorites") return null;
          const groupChecked = !state.hiddenGroups.includes(group.label);
          return (
            <Box key={group.label}>
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/30">
                <Checkbox
                  checked={groupChecked}
                  onChange={() => toggleGroup(group.label)}
                  size="sm"
                />
                <Text size="sm" fw={600}>
                  {group.label}
                </Text>
              </div>
              <ItemList
                items={group.items}
                hiddenItems={state.hiddenItems}
                toggleItem={toggleItem}
                groupHidden={!groupChecked}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <Stack gap="lg">
      <Title order={2}>Settings</Title>

      <Paper withBorder p="lg" radius="md">
        <Group>
          <Avatar src={user?.imageUrl} size="xl" radius="xl" />
          <div>
            <Text fw={600} size="lg">
              {user?.fullName}
            </Text>
            <Text size="sm" c="dimmed">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </div>
        </Group>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Text fw={500} mb="sm">
          Account
        </Text>
        <Text size="sm" c="dimmed">
          Manage your account settings and preferences through Clerk.
        </Text>
      </Paper>

      <SidebarFavoritesSection />
      <SidebarVisibilitySection />
    </Stack>
  );
}
