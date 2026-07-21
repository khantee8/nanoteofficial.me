import Link from "next/link";
import { btnSecondary } from "@/components/plan/ui";

/** Entry point for the AI Slide Generator add-on — sits next to a project's
 *  edit/archive actions and links to that project's slides sub-page. Visible
 *  to every role (viewers can view/export existing decks there too); the
 *  generate wizard itself is gated inside the slides page. */
export function SlidesLink({ projectId, label }: { projectId: string; label: string }) {
  return (
    <Link href={`/plan/${projectId}/slides`} className={btnSecondary}>
      {label}
    </Link>
  );
}
