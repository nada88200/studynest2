// app/api/auth/[...nextauth]/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import connectMongoDB from "@/lib/mongodb";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectMongoDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          photo: user.photo,
          archives: user.archives,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 0,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.photo = user.photo;
        token.role = user.role;
        token.archives = user.archives;
        token.userCourses = user.userCourses || [];
      }
      if (trigger === "update" && session?.user) {
        token = { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.photo = token.photo;
        session.user.role = token.role;
        session.user.archives = token.archives;
        session.user.userCourses = token.userCourses || [];
      }
      return session;
    },
  },
};
