'use client'

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false, // prevent redirect so we can show toast
      callbackUrl: "/dashboard",
    });

    if (res?.error) {
      let message = '';

      switch (res.error) {
        case 'CredentialsSignin':
          message = 'Invalid username or password';
          break;
        case 'OAuthAccountNotLinked':
          message = 'Account not linked. Try using the same provider as before.';
          break;
        case 'AccessDenied':
          message = 'Access denied.';
          break;
        default:
          message = 'An unexpected error occurred.';
      }
      console.log(res)
      console.log(res?.error)
      toast.error(message);
    } else if (res?.ok) {
      window.location.href = res.url; // manually redirect on success
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Sign in with Credentials</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-3 p-2 w-full border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 w-full border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-teal-400 hover:bg-teal-500 text-white py-2 rounded shadow-2xl"
        >
          Sign In
        </button>

        <div className="text-center my-4">or</div>

        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full border py-2 rounded mb-2"
        >
          Sign in with GitHub
        </button>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full border py-2 rounded"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
