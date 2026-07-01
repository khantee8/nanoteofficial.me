"use client";
import { useTransition } from "react";
import { setUserRole } from "@/lib/plan/actions";
import { USER_ROLES } from "@/lib/plan/types";
import type { UserRole } from "@/lib/db/schema";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { roleKey } from "@/lib/plan/i18n";
import { inputCls } from "./ui";

export function RoleSelect({
  userId, role, disabled = false,
}: {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const onChange = (next: UserRole) => {
    startTransition(async () => {
      try {
        await setUserRole(userId, next);
        toast(t("toast.roleUpdated"), { tone: "success" });
      } catch {
        toast(t("toast.roleUpdateErr"), { tone: "error" });
      }
    });
  };

  return (
    <select
      value={role}
      disabled={disabled || pending}
      onChange={(e) => onChange(e.target.value as UserRole)}
      className={`${inputCls} max-w-[10rem] disabled:opacity-50`}
    >
      {USER_ROLES.map((r) => <option key={r} value={r}>{t(roleKey(r))}</option>)}
    </select>
  );
}
