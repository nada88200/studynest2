import NextAuth from "next-auth";
import Credentialsprovider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";

export const authOptions = {
  providers: [
    Credentialsprovider({
        name: "Credentials",
        credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return { id: user._id, email: user.email, name: user.name, role: user.role };
        } catch (error) {
          console.log("Error: ", error);
        }
      },
    }),
  ],
  session : {
      strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
      signIn: "/",
  },
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.name = user.name;
            token.email = user.email;
            token.role = user.role;
        }
        return token;
        },
        async session({ session, token }) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        return session;
        },
    },
};

const handler = NextAuth(authOptions);

export {handler as GET ,handler as POST};
