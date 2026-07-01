import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/db/schema";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: DefaultSession["user"] & {
      role: UserRole;
    };
  }
}
