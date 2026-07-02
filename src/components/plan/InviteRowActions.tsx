"use client";
import { useTransition } from "react";
import { resendInvite, revokeInvite } from "@/lib/plan/actions";
import { useToast } from "./Toaster";
import { usePlanT } from "./LangContext";
import { btnDanger, btnGhost } from "./ui";

export function InviteRowActions({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const { t } = usePlanT();

  const resend = () => startTransition(async () => {
    try {
      const r = await resendInvite(inviteId);
      toast(t(r.emailSent ? "toast.inviteResent" : "toast.inviteNoEmail"), {
        tone: r.emailSent ? "success" : "info",
      });
    } catch { toast(t("toast.inviteErr"), { tone: "error" }); }
  });

  const revoke = () => startTransition(async () => {
    try {
      await revokeInvite(inviteId);
      toast(t("toast.inviteRevoked"), { tone: "success" });
    } catch { toast(t("toast.inviteErr"), { tone: "error" }); }
  });

  return (
    <div className="flex items-center gap-1">
      <button onClick={resend} disabled={pending} className={btnGhost}>{t("invite.resend")}</button>
      <button onClick={revoke} disabled={pending} className={btnDanger}>{t("invite.revoke")}</button>
    </div>
  );
}
