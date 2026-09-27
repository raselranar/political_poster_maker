"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function AuthActions() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(Boolean(localStorage.getItem("token")));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <>
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "lg" })}>
          Sign in
        </Link>
        <Link
          href="/register"
          className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Sign up
        </Link>
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={buttonVariants({ variant: "outline", size: "lg" })}>
      <LogOut data-icon="inline-start" />
      Sign out
    </button>
  );
}
