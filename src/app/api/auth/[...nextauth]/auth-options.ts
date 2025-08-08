import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "boolean" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          throw new Error(
            JSON.stringify({
              code: 400,
              message: "Email dan password wajib diisi.",
            })
          );
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const result: any = await response.json();
          console.log("API Response JSON:", result);

          if (!response.ok || result.status !== "success") {
            throw new Error(
              JSON.stringify({
                code: response.status,
                message: result.message || "Login gagal",
              })
            );
          }

          const user = result.user;
          const token = result.access_token;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            status: user.status,
            roleId: user.roleId,
            avatar: user.avatar,
            token: token, // ✅ Token dimasukkan di sini
          };
        } catch (err: any) {
          const message = err?.message || "Login error";
          throw new Error(JSON.stringify({ code: 500, message: message }));
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      async profile(profile) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: profile.name,
              avatar: profile.picture || null,
              lastSignInAt: new Date(),
            },
          });

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name || "Anonymous",
            status: existingUser.status,
            roleId: existingUser.roleId,
            roleName: existingUser.role.name,
            avatar: existingUser.avatar,
          };
        }

        const defaultRole = await prisma.userRole.findFirst({
          where: { isDefault: true },
        });

        if (!defaultRole) {
          throw new Error(
            "Default role not found. Unable to create a new user."
          );
        }

        const newUser = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            password: "",
            avatar: profile.picture || null,
            emailVerifiedAt: new Date(),
            roleId: defaultRole.id,
            status: "ACTIVE",
          },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name || "Anonymous",
          status: newUser.status,
          avatar: newUser.avatar,
          roleId: newUser.roleId,
          roleName: defaultRole.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({
      token,
      user,
      session,
      trigger,
    }: {
      token: JWT;
      user: User;
      session?: Session;
      trigger?: "signIn" | "signUp" | "update";
    }) {
      console.log("JWT Callback START:", { token, user, session, trigger });

      if (trigger === "update" && session?.user) {
        token = session.user;
      } else if (user) {
        const role = user.roleId
          ? await prisma.userRole.findUnique({ where: { id: user.roleId } })
          : null;

        token.id = (user.id || token.sub) as string;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.status = user.status;
        token.roleId = user.roleId;
        token.roleName = role?.name || token.roleName;
        token.token = (user as any).token || token.token; // ✅ Token selalu masuk
      }

      console.log("JWT Callback END:", token);
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("Session Callback START:", { session, token });

      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.roleId = token.roleId;
        session.user.roleName = token.roleName;
        session.user.token = token.token; // ✅ Token dimasukkan ke session user
      }

      console.log("Session Callback END:", session.user);
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

export default authOptions;
