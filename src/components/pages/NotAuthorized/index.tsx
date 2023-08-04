import React from "react";
import Typography from "@atoms/Typography";
import { UserX } from "lucide-react";
import { useTranslate } from "@hooks";
import { Button } from "@atoms/Button";
import { SignedIn, SignedOut, SignIn, SignOutButton } from "@clerk/nextjs";

const NotAuthorized = () => {
  const { t } = useTranslate();

  return (
    <div className="flex h-full w-full flex-col justify-center p-20">
      <SignedIn>
        <div className="flex flex-col items-center gap-y-2">
          <UserX size={300} className="stroke-tertiary" />
          <Typography variant="h1" weight="semibold">
            {t("notAuthorized.title")}
          </Typography>
          <Typography variant="h2" color="gray" weight="medium" text="center">
            {t("notAuthorized.descriptionSignedIn")}
          </Typography>
        </div>
        <div className="flex justify-center">
          <SignOutButton>
            <Button variant="tertiary">{t("signOut")}</Button>
          </SignOutButton>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center">
          <SignIn signUpUrl="/sign-up" />
        </div>
      </SignedOut>
    </div>
  );
};

export default NotAuthorized;
