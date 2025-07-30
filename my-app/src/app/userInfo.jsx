"use client"
import { useSession } from 'next-auth/react';

export default function UserInfo({ children }) {
  const { data: session, status } = useSession();
  console.log(session)

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }
  return <>{typeof children === 'function' ? children(session) : children}</>;
}

// import { auth } from "../auth";

// export default async function UserInfo({ children }) {
//   const session = await auth();
//   console.log(session);

//   if (!session) {
//     return <p>Not signed in</p>;
//   }

//   return <>{typeof children === "function" ? children(session) : null}</>;
// }
