"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Center, Loader } from "@mantine/core";

export default function LogoutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    signOut({ redirectUrl: "/sign-in" });
  }, [signOut]);

  return (
    <Center h="60vh">
      <Loader />
    </Center>
  );
}
