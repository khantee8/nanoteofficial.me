import type { Lang } from "@/lib/i18n";

/**
 * /plan-scoped dictionary. Kept separate from the site-wide `@/lib/i18n` (which
 * imports `next/headers` and is therefore server-only) so these strings can be
 * used from client components too. `pt(lang, key)` is a pure function.
 */
const dict = {
  "nav.projects": { en: "Projects", th: "โปรเจกต์" },
  "nav.admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
  "nav.menu": { en: "Menu", th: "เมนู" },
  "action.signOut": { en: "Sign out", th: "ออกจากระบบ" },

  "overview.teamLoad": { en: "Team load", th: "ภาระงานของทีม" },
  "project.new": { en: "New project", th: "โปรเจกต์ใหม่" },

  "project.back": { en: "Projects", th: "โปรเจกต์" },
  "project.target": { en: "Target", th: "กำหนดส่ง" },
  "project.edit": { en: "Edit", th: "แก้ไข" },
  "project.archive": { en: "Archive", th: "เก็บเข้าคลัง" },
  "project.archiveConfirm": { en: "Archive this project?", th: "เก็บโปรเจกต์นี้เข้าคลังหรือไม่?" },

  "view.table": { en: "Table", th: "ตาราง" },
  "view.kanban": { en: "Kanban", th: "คัมบัง" },
  "view.calendar": { en: "Calendar", th: "ปฏิทิน" },
  "view.gantt": { en: "Gantt", th: "แกนต์" },
  "view.burndown": { en: "Burndown", th: "เบิร์นดาวน์" },

  "status.backlog": { en: "Backlog", th: "รอดำเนินการ" },
  "status.todo": { en: "To do", th: "ที่ต้องทำ" },
  "status.in_progress": { en: "In progress", th: "กำลังทำ" },
  "status.done": { en: "Done", th: "เสร็จแล้ว" },

  "type.it": { en: "IT", th: "ไอที" },
  "type.travel": { en: "Travel", th: "ท่องเที่ยว" },
  "type.interview": { en: "Interview", th: "สัมภาษณ์งาน" },
  "type.general": { en: "General", th: "ทั่วไป" },

  "stat.done": { en: "done", th: "เสร็จ" },

  "task.add": { en: "Add task", th: "เพิ่มงาน" },
  "task.title": { en: "Task title", th: "ชื่องาน" },
  "task.description": { en: "Description (optional)", th: "รายละเอียด (ไม่บังคับ)" },
  "task.status": { en: "Status", th: "สถานะ" },
  "task.assignee": { en: "Assignee", th: "ผู้รับผิดชอบ" },
  "task.unassigned": { en: "— Unassigned —", th: "— ยังไม่มอบหมาย —" },
  "task.start": { en: "Start date", th: "วันเริ่ม" },
  "task.due": { en: "Due date", th: "กำหนดส่ง" },
  "task.estimate": { en: "Estimate (h)", th: "ประมาณการ (ชม.)" },
  "task.cost": { en: "Cost", th: "ต้นทุน" },
  "task.tags": { en: "tags, comma separated", th: "แท็ก คั่นด้วยเครื่องหมายจุลภาค" },
  "task.editTitle": { en: "Edit task", th: "แก้ไขงาน" },
  "task.deleteBtn": { en: "Delete task", th: "ลบงาน" },

  "common.save": { en: "Save", th: "บันทึก" },
  "common.saving": { en: "Saving…", th: "กำลังบันทึก…" },
  "common.cancel": { en: "Cancel", th: "ยกเลิก" },
  "common.delete": { en: "Delete", th: "ลบ" },
  "common.close": { en: "Close", th: "ปิด" },

  "pf.name": { en: "Project name", th: "ชื่อโปรเจกต์" },
  "pf.type": { en: "Type", th: "ประเภท" },
  "pf.target": { en: "Target date", th: "กำหนดส่ง" },
  "pf.color": { en: "Color", th: "สี" },

  "table.search": { en: "Search tasks…", th: "ค้นหางาน…" },
  "table.allStatuses": { en: "All statuses", th: "ทุกสถานะ" },
  "table.of": { en: "of", th: "จาก" },
  "table.emptyNone": { en: "No tasks yet. Use “Add task” above to create your first one.", th: "ยังไม่มีงาน กด“เพิ่มงาน”ด้านบนเพื่อสร้างงานแรกของคุณ" },
  "table.emptyFilter": { en: "No tasks match your filters.", th: "ไม่มีงานที่ตรงกับตัวกรอง" },
  "col.title": { en: "Title", th: "ชื่อ" },
  "col.status": { en: "Status", th: "สถานะ" },
  "col.assignee": { en: "Assignee", th: "ผู้รับผิดชอบ" },
  "col.due": { en: "Due", th: "กำหนดส่ง" },
  "col.estimate": { en: "Est (h)", th: "ประมาณ (ชม.)" },
  "col.cost": { en: "Cost", th: "ต้นทุน" },

  "kanban.add": { en: "Add", th: "เพิ่ม" },
  "kanban.quick": { en: "Task title…", th: "ชื่องาน…" },

  "grid.empty": {
    en: "No projects yet. Create your first project to start planning.",
    th: "ยังไม่มีโปรเจกต์ สร้างโปรเจกต์แรกของคุณเพื่อเริ่มวางแผน",
  },

  "bd.burndown": { en: "Burndown", th: "เบิร์นดาวน์" },
  "bd.hours": { en: "hours", th: "ชั่วโมง" },
  "bd.tasks": { en: "tasks", th: "งาน" },
  "bd.remaining": { en: "remaining", th: "คงเหลือ" },
  "bd.ideal": { en: "ideal", th: "เป้าหมาย" },
  "bd.today": { en: "today", th: "วันนี้" },
  "bd.empty": {
    en: "Not enough task history yet to chart a burndown. Add tasks (with estimates for an hours-based chart) and complete a few to see the trend.",
    th: "ข้อมูลงานยังไม่พอที่จะสร้างกราฟเบิร์นดาวน์ เพิ่มงาน (พร้อมประมาณการชั่วโมงสำหรับกราฟแบบชั่วโมง) และทำให้เสร็จสักสองสามงานเพื่อดูแนวโน้ม",
  },

  "gantt.today": { en: "today", th: "วันนี้" },
  "gantt.unscheduled": { en: "Unscheduled", th: "ยังไม่กำหนดวัน" },
  "gantt.resize": { en: "Resize task column", th: "ปรับความกว้างคอลัมน์งาน" },
  "gantt.empty": {
    en: "No scheduled tasks yet. Give tasks a start or due date to see them on the timeline.",
    th: "ยังไม่มีงานที่กำหนดวัน กำหนดวันเริ่มหรือวันครบกำหนดให้งานเพื่อแสดงบนไทม์ไลน์",
  },

  "tl.desc": {
    en: "Open (non-done) work across active projects. Bars compare allocated hours to an assumed {cap}h capacity per person.",
    th: "งานที่ยังไม่เสร็จในโปรเจกต์ที่ใช้งานอยู่ แถบเปรียบเทียบชั่วโมงที่จัดสรรกับกำลังคนที่สมมติไว้ {cap} ชม. ต่อคน",
  },
  "tl.unassigned": { en: "Unassigned", th: "ยังไม่มอบหมาย" },
  "tl.over": { en: "over capacity", th: "เกินกำลัง" },
  "tl.tasks": { en: "tasks", th: "งาน" },
  "tl.empty": {
    en: "No open tasks across active projects. Assign tasks (with hour estimates) to see capacity vs. allocation here.",
    th: "ไม่มีงานค้างในโปรเจกต์ที่ใช้งานอยู่ มอบหมายงาน (พร้อมประมาณการชั่วโมง) เพื่อดูกำลังคนเทียบกับการจัดสรรที่นี่",
  },

  "signin.title": { en: "Sign in", th: "เข้าสู่ระบบ" },
  "signin.desc": {
    en: "Invite-only workspace. Enter your email and we’ll send a magic link.",
    th: "พื้นที่ทำงานสำหรับผู้ได้รับเชิญเท่านั้น กรอกอีเมลของคุณแล้วเราจะส่งลิงก์สำหรับเข้าสู่ระบบ",
  },
  "signin.send": { en: "Send magic link", th: "ส่งลิงก์เข้าสู่ระบบ" },
  "signin.sending": { en: "Sending…", th: "กำลังส่ง…" },
  "signin.sentTitle": { en: "Check your inbox", th: "ตรวจสอบอีเมลของคุณ" },
  "signin.sentDesc": {
    en: "We sent you a sign-in link. It may take a moment to arrive.",
    th: "เราได้ส่งลิงก์สำหรับเข้าสู่ระบบให้คุณแล้ว อาจใช้เวลาสักครู่กว่าจะถึง",
  },

  "cmd.placeholder": { en: "Jump to a project…", th: "ไปยังโปรเจกต์…" },
  "cmd.overview": { en: "Projects overview", th: "ภาพรวมโปรเจกต์" },
  "cmd.overviewSub": { en: "Go to /plan", th: "ไปที่ /plan" },
  "cmd.noMatch": { en: "No matches", th: "ไม่พบรายการ" },
  "cmd.hint": { en: "↑↓ navigate · ↵ open · esc close", th: "↑↓ เลื่อน · ↵ เปิด · esc ปิด" },

  "toast.taskCreated": { en: "Task created", th: "สร้างงานแล้ว" },
  "toast.taskUpdated": { en: "Task updated", th: "อัปเดตงานแล้ว" },
  "toast.taskSaveErr": { en: "Couldn’t save task", th: "บันทึกงานไม่สำเร็จ" },
  "toast.taskDeleted": { en: "Task deleted", th: "ลบงานแล้ว" },
  "toast.taskDeleteErr": { en: "Couldn’t delete task", th: "ลบงานไม่สำเร็จ" },
  "toast.taskMoveErr": { en: "Couldn’t move task", th: "ย้ายงานไม่สำเร็จ" },
  "toast.taskAddErr": { en: "Couldn’t add task", th: "เพิ่มงานไม่สำเร็จ" },
  "toast.undo": { en: "Undo", th: "เลิกทำ" },
  "toast.projectCreated": { en: "Project created", th: "สร้างโปรเจกต์แล้ว" },
  "toast.projectUpdated": { en: "Project updated", th: "อัปเดตโปรเจกต์แล้ว" },
  "toast.projectSaveErr": { en: "Couldn’t save project", th: "บันทึกโปรเจกต์ไม่สำเร็จ" },
  "toast.projectArchived": { en: "Project archived", th: "เก็บโปรเจกต์เข้าคลังแล้ว" },
  "toast.projectArchiveErr": { en: "Couldn’t archive project", th: "เก็บโปรเจกต์เข้าคลังไม่สำเร็จ" },
  "toast.roleUpdated": { en: "Role updated", th: "อัปเดตบทบาทแล้ว" },
  "toast.roleUpdateErr": { en: "Couldn’t update role", th: "อัปเดตบทบาทไม่สำเร็จ" },

  "role.admin": { en: "Admin", th: "ผู้ดูแลระบบ" },
  "role.editor": { en: "Editor", th: "ผู้แก้ไข" },
  "role.viewer": { en: "Viewer", th: "ผู้ชม" },

  "admin.title": { en: "Manage users", th: "จัดการผู้ใช้" },
  "admin.user": { en: "User", th: "ผู้ใช้" },
  "admin.role": { en: "Role", th: "บทบาท" },
  "admin.invites": { en: "Invite coworkers", th: "เชิญเพื่อนร่วมงาน" },
  "admin.invitesDesc": {
    en: "Invited emails can sign in with a magic link. Revoke an invite to withdraw access before first sign-in.",
    th: "อีเมลที่ได้รับเชิญสามารถเข้าสู่ระบบด้วยลิงก์วิเศษ เพิกถอนคำเชิญเพื่อยกเลิกสิทธิ์ก่อนการเข้าสู่ระบบครั้งแรก",
  },
  "admin.invitedOn": { en: "Invited", th: "เชิญเมื่อ" },
  "admin.noInvites": { en: "No pending invites.", th: "ไม่มีคำเชิญที่รอดำเนินการ" },
  "invite.emailPh": { en: "coworker@example.com", th: "coworker@example.com" },
  "invite.send": { en: "Send invite", th: "ส่งคำเชิญ" },
  "invite.sending": { en: "Sending…", th: "กำลังส่ง…" },
  "invite.resend": { en: "Resend", th: "ส่งอีกครั้ง" },
  "invite.revoke": { en: "Revoke", th: "เพิกถอน" },
  "toast.inviteSent": { en: "Invite sent", th: "ส่งคำเชิญแล้ว" },
  "toast.inviteNoEmail": {
    en: "Invite saved, but the email couldn’t be sent — use Resend.",
    th: "บันทึกคำเชิญแล้ว แต่ส่งอีเมลไม่สำเร็จ — กด“ส่งอีกครั้ง”",
  },
  "toast.inviteExists": { en: "That email is already a user or invited", th: "อีเมลนี้เป็นผู้ใช้อยู่แล้วหรือได้รับเชิญแล้ว" },
  "toast.inviteInvalid": { en: "Enter a valid email address", th: "กรอกอีเมลให้ถูกต้อง" },
  "toast.inviteResent": { en: "Invite re-sent", th: "ส่งคำเชิญอีกครั้งแล้ว" },
  "toast.inviteRevoked": { en: "Invite revoked", th: "เพิกถอนคำเชิญแล้ว" },
  "toast.inviteErr": { en: "Couldn’t update invite", th: "อัปเดตคำเชิญไม่สำเร็จ" },
} as const;

export type PlanKey = keyof typeof dict;

export function pt(lang: Lang, key: PlanKey, vars?: Record<string, string | number>): string {
  let s: string = dict[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}

export const statusKey = (s: string) => `status.${s}` as PlanKey;
export const typeKey = (s: string) => `type.${s}` as PlanKey;
export const roleKey = (r: string) => `role.${r}` as PlanKey;
