import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail, createUser } from "./database";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        let user = null;

        // Handle different login methods
        if (credentials.email) {
          user = await findUserByEmail(credentials.email);
        } else if (credentials.phone) {
          user = await findUserByPhone(credentials.phone);
        } else if (credentials.username) {
          user = await findUserByUsername(credentials.username);
        }

        if (!user || !credentials.password) return null;

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!isValidPassword) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.display_name,
          image: user.photo_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const existingUser = await findUserByEmail(user.email!);

        if (!existingUser) {
          // Create new user from Google OAuth
          const newUser = await createUser({
            email: user.email!,
            displayName: user.name || user.email!.split("@")[0],
            passwordHash: "", // Google users don't need password
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
