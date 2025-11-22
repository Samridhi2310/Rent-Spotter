// import NextAuth from "next-auth";
// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           const res = await fetch("/api/proxy/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               username: credentials.username,
//               password: credentials.password,
//             }),
//           });

//           const user = await res.json();
//           console.log(user._id)

//           if (!res.ok || !user) {
//             throw new Error(user.message || "Invalid credentials");
//           }

//           return {
//             id: user.id,
//             name: user.username,
//             email: user.email,
//             role: user.role,
//           };
//         } catch (err) {
//           throw new Error("Login failed: " + err.message);
//         }
//       },
//     }),

//     GitHubProvider({
//       clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
//       clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET,
//     }),

//     GoogleProvider({
//       clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
//       clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
//     }),
//   ],
//   secret: process.env.NEXT_PUBLIC_AUTH_SECRET,

//   session: {
//     strategy: "jwt",
//   },
//   jwt: {
//     secret: process.env.NEXT_PUBLIC_JWT_SECRET, // Ensure this matches your backend's secret
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role || null;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session?.user) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//       }
//       return session;
//     },
//   },


//   pages: {
//     signIn: "/signin",
//   },
// };

// const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
// export { handlers, signIn, signOut, auth };

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });
              console.log("Response status:", res.status);

          const user = await res.json();
    console.log("User response:", user);

          if (!res.ok || !user) {
            throw new Error(user.message || "Invalid credentials");
          }

          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,

          };
        } catch (err) {
          console.log(err.error)
            console.error("Authorize error (frontend):", error);

          throw new Error("Login failed: " + err.message);
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  trustHost:true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 15 * 60, // Update session every 15 minutes
  },
  jwt: {
    secret: process.env.NEXT_PUBLIC_AUTH_SECRET, // Use NEXT_PUBLIC_AUTH_SECRET for consistency
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role || "user"; // Default to 'user' for social providers
      }
      if (account?.provider === "github" || account?.provider === "google") {
        // Optionally sync social provider user to MongoDB
        try {
          const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/proxy/user/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: token.email,
              username: token.name || token.email.split("@")[0],
              provider: account.provider,
            }),
          });
          const syncedUser = await res.json();
          if (res.ok && syncedUser) {
            token.id = syncedUser.id;
            token.role = syncedUser.role || "user";
          }
        } catch (err) {
          console.error("Failed to sync social user:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
export { handlers, signIn, signOut, auth };
