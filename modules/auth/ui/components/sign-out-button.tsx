"use client";

import { useLogout } from "@/modules/auth/hooks/mutations/use-auth-mutations";
import { Button } from "flowbite-react";
import { useTranslations } from "next-intl";

export function SignOutButton() {
  const t = useTranslations("auth");
  const { mutate: logout, isPending } = useLogout();

  return (
    <Button
      color="failure"
      size="sm"
      disabled={isPending}
      onClick={() => logout()}
    >
      {isPending ? "..." : t("logout")}
    </Button>
  );
}
