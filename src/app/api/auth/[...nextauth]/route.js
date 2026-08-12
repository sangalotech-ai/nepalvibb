import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),
    CredentialsProvider({
      name: "Credentials Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = credentials.email.trim().toLowerCase();
        
        await dbConnect();
        let userDoc = await User.findOne({ email: normalizedEmail });
        if (!userDoc) {
          userDoc = await User.create({
            name: credentials.name || normalizedEmail.split('@')[0] || "User",
            email: normalizedEmail,
            password: credentials.password.trim(),
          });
        }

        return { 
          id: userDoc._id.toString(), 
          name: userDoc.name, 
          email: userDoc.email,
          role: userDoc.role || 'user'
        };
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token?.id || token?.sub;
        if (token?.email) session.user.email = token.email;
        if (token?.name) session.user.name = token.name;
        if (token?.role) session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login',
  },
};

const handler = (req, res) => {
  console.log("NextAuth Request:", req.method);
  return NextAuth(req, res, authOptions);
};

export { handler as GET, handler as POST };
