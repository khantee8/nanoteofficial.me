"use client";
import { Drawer } from "./Drawer";
import { TaskForm } from "./TaskForm";
import { StatusBadge, btnDanger } from "./ui";
import { updateTask } from "@/lib/plan/actions";
import type { PlanUser } from "@/lib/plan/types";
import type { Task } from "@/lib/db/schema";

export function TaskDrawer({
  task, users, onClose, onDelete,
}: {
  task: Task | null;
  users: PlanUser[];
  onClose: () => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <Drawer
      open={task != null}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          Edit task {task && <StatusBadge status={task.status} />}
        </span>
      }
    >
      {task && (
        <div className="flex flex-col gap-6">
          <TaskForm
            projectId={task.projectId}
            task={task}
            users={users}
            bare
            action={async (fd) => { await updateTask(task.id, fd); onClose(); }}
          />
          <div className="border-t border-[var(--border)] pt-4">
            <button onClick={() => { onDelete(task); onClose(); }} className={btnDanger}>
              Delete task
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
