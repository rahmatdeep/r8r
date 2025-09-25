import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    userId: string;
    user: {
      email: string;
      name: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    token: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/signin`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          return {
            id: response.data.userId.toString(),
            email: credentials?.email || "",
            name: response.data.name || "",
            token: response.data.token,
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(
              error.response?.data.message || "Authentication failed"
            );
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session) {
        session.accessToken = token.accessToken as string;
        session.userId = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
