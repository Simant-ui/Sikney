import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "@/auth.config";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}
class AccountBlockedError extends CredentialsSignin {
  code = "ACCOUNT_BLOCKED";
}
class TeacherPendingApprovalError extends CredentialsSignin {
  code = "TEACHER_PENDING_APPROVAL";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        if (!user.isEmailVerified) {
          throw new EmailNotVerifiedError();
        }
        if (user.status === "blocked") {
          throw new AccountBlockedError();
        }
        if (user.role === "teacher" && user.status === "pending") {
          throw new TeacherPendingApprovalError();
        }

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
});
