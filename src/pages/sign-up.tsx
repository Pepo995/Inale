import React from "react";

import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { SignUp } from "@clerk/clerk-react";

type SignUpPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SignUpPage: NextPage<SignUpPageProps> = () => (
  <div className="flex h-full w-full flex-col justify-center p-20">
    <div className="flex items-center justify-center">
      <SignUp />
    </div>
  </div>
);

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default SignUpPage;
