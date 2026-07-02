"use client";
import { useRef, useTransition } from "react";
import { createInvite } from "@/lib/plan/actions";
import { USER_ROLES } from "@/lib/plan/types";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { roleKey } from "@/lib/plan/i18n";
import { btnPrimary, inputCls } from "./ui";

export function InviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const onSubmit = (fd: FormData) => {
    startTransition(async () => {
      try {
        const res = await createInvite(fd);
        if (!res.ok) {
          toast(t(res.reason === "exists" ? "toast.inviteExists" : "toast.inviteInvalid"), { tone: "error" });
          return;
        }
        toast(t(res.emailSent ? "toast.inviteSent" : "toast.inviteNoEmail"), {
          tone: res.emailSent ? "success" : "info",
        });
        formRef.current?.reset();
      } catch {
        toast(t("toast.inviteErr"), { tone: "error" });
      }
    });
  };

  return (
    <form ref={formRef} action={onSubmit} className="flex flex-wrap items-center gap-2">
      <input name="email" type="email" required placeholder={t("invite.emailPh")}
        className={`${inputCls} max-w-xs`} />
      <select name="role" defaultValue="viewer" className={`${inputCls} max-w-[10rem]`}>
        {USER_ROLES.map((r) => <option key={r} value={r}>{t(roleKey(r))}</option>)}
      </select>
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? t("invite.sending") : t("invite.send")}
      </button>
    </form>
  );
}
