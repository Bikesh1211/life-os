"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Group, Text, ActionIcon } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";
import { useUpdateTask } from "../hooks";

function SortableTaskCard({ task, children }: { task: any; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Group gap={0} wrap="nowrap" align="flex-start">
        <ActionIcon
          variant="subtle"
          size="sm"
          color="gray"
          style={{ cursor: "grab", marginTop: 12, flexShrink: 0 }}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={14} />
        </ActionIcon>
        <div style={{ flex: 1 }}>{children}</div>
      </Group>
    </div>
  );
}

type DndTaskListProps = {
  tasks: any[];
  children: (task: any, index: number) => React.ReactNode;
};

export function DndTaskList({ tasks, children }: DndTaskListProps) {
  const updateTask = useUpdateTask();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tasks.findIndex((t: any) => t.id === active.id);
      const newIndex = tasks.findIndex((t: any) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(tasks, oldIndex, newIndex);
      for (let i = 0; i < reordered.length; i++) {
        if (reordered[i].order !== i) {
          updateTask.mutate({ id: reordered[i].id, order: i });
        }
      }
    },
    [tasks, updateTask],
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
        <div>
          {tasks.map((task, index) => (
            <SortableTaskCard key={task.id} task={task}>
              {children(task, index)}
            </SortableTaskCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}