import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { AccountSchema } from "./schema";
import { ZodError } from "zod";
import { connectToDatabase } from "./lib/db";
import UserModel from "./models/UserModel";
import bcrypt from "bcryptjs";
import { getFileUrl } from "./utils";

// Augment the User type in next-auth
declare module "next-auth" {
  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    banner?: string | null;
    username?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      image?: string;
      banner?: string;
    };
  }
}

class NextAuthError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
    this.message = message;
  }
}

const composeUser = (user: any) => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    username: user.username,
    image: user?.image ? getFileUrl(user._id.toString(),user.image) : null,
    banner: user?.banner ? getFileUrl(user._id.toString(),user.banner) : null,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "credentials-up",
      name: "Credentials",
      credentials: {
        name: { label: "Name", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password, name } = await AccountSchema.parseAsync(
            credentials
          );
          console.log("Success in authenticating", email, password, name);
          // connect to the db
          await connectToDatabase();
          // check if the user exists
          const user = await UserModel.findOne({ email });
          if (user) {
            throw new NextAuthError("User already exists");
          }
          //create account
          const hash = await bcrypt.hash(password, 10);
          const newUser = await UserModel.create({
            email,
            password: hash,
            name,
            username: email.split("@")[0],
          });
          return composeUser(newUser);
        } catch (error: any) {
          let message = error.message;
          if (error instanceof ZodError) {
            const _error: ZodError = error;
            const issues = _error.issues;
            message = issues.map((issue) => issue.message).join(", ");
          }
          throw new NextAuthError(message);
        }
      },
    }),
    Credentials({
      id: "credentials-in",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const SignInSchema = AccountSchema.pick({
            email: true,
            password: true,
          });
          const { email, password } = await SignInSchema.parseAsync(
            credentials
          );
          console.log(email, password);
          // connect to the db
          await connectToDatabase();
          // check if the user exists
          const user = await UserModel.findOne({ email });
          if (!user) {
            throw new NextAuthError("Wrong email/password provided");
          }
          //create account
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            throw new NextAuthError("Wrong email/password provided");
          }
          console.log("User", user);
          return composeUser(user);
        } catch (error: any) {
          let message = error.message;
          if (error instanceof ZodError) {
            const _error: ZodError = error;
            const issues = _error.issues;
            message = issues.map((issue) => issue.message).join(", ");
          }
          throw new NextAuthError(message);
        }
      },
    }),
  ],
  callbacks: {
    signIn({ user }) {
      if (!user) throw new NextAuthError("Login failed.");
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user as any
      }
      return session;
    },
    async jwt({ token, user }) {
        if (token && user) {
          token.user = user;
        }
        return token;
    },
  },
  
  
});
