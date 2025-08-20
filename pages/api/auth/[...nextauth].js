import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/database";
import AdminUser from "@/lib/models/adminUser";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await AdminUser.findOne({ username: credentials.username });
        if (!user) return null;

        const isMatch = await user.comparePassword(credentials.password);
        if (!isMatch) return null;

        //set user as active
        // user.active = true;
        // user.save()

        return {
          id: user._id.toString(),
          name: user.username,
          role: user.role,
          permissions: user.permissions,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        permissions: token.permissions,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
