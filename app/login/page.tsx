"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState("");

  const submit = async () => {
    setStatus("Working...");

    const action =
      mode === "signup"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

    const { error } = await action;

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Success!");
    router.push("/");
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>{mode === "signup" ? "Create Account" : "Login"}</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={submit}>
        {mode === "signup" ? "Sign Up" : "Login"}
      </button>

      <button
        onClick={() =>
          setMode(mode === "signup" ? "login" : "signup")
        }
      >
        Switch to {mode === "signup" ? "Login" : "Sign Up"}
      </button>

      <p>{status}</p>
    </div>
  );
}