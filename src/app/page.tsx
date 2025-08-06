"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("signin"); // Redirect ke /view/signin
  }, [router]);

  return null; // Tidak menampilkan apapun karena langsung redirect
}
