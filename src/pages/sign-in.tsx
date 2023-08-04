import React from "react";

import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SignIn } from "@clerk/clerk-react";

type SignInPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SignInPage: NextPage<SignInPageProps> = () => (
  <div className="flex h-full w-full flex-col justify-center p-20">
    <div className="flex items-center justify-center">
      <SignIn signUpUrl="/sign-up" />
    </div>
  </div>
);

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default SignInPage;
