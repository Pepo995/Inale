import { type ReactElement } from "react";

import Layout from "@templates/desktop/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import * as z from "zod";

import type { NextPageWithLayout } from "./_app";
import type { GetServerSideProps } from "next";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormTextInput } from "@atoms/TextInput";
import { Button } from "@atoms/Button";
import Typography from "@atoms/Typography";
import { api } from "@utils";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { Card, CardContent, CardFooter, CardHeader } from "@atoms/Card";
import { useTranslate } from "@hooks";

const Header = () => {
  const { t } = useTranslate();
  return (
    <Typography variant="h2" weight="semibold" color="bgSecondary">
      {t("addAdmin.title")}
    </Typography>
  );
};

const InviteNewAdmin: NextPageWithLayout = () => {
  const { t } = useTranslate();
  const schema = z.object({
    email: z.string().email(t("errors.invalidMail")),
  });

  type InvitationForm = z.infer<typeof schema>;

  const methods = useForm<InvitationForm>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const addNewAdminMutation = api.users.addNewAdmin.useMutation();

  const onSubmit = async ({ email: userEmail }: InvitationForm) => {
    const { success, translationKey } = await addNewAdminMutation.mutateAsync({
      userEmail,
    });
    toast.custom(
      (toastElement) => (
        <Alert
          alertVariant={success ? "success" : "error"}
          onClose={() => toast.remove(toastElement.id)}
        >
          {success
            ? t("addAdmin.success", { userEmail })
            : t(translationKey ?? "errors.default")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
  };

  return (
    <div className="flex h-full w-full items-start justify-start">
      <Card>
        <CardHeader>
          <Typography variant="h3" weight="semibold" color="gray">
            {t("addAdmin.description")}
          </Typography>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form>
              <div className="flex items-center gap-2">
                <FormTextInput type="text" name="email" className="h-10" />
              </div>
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter>
          <Button
            variant="tertiary"
            type="submit"
            onClick={methods.handleSubmit(onSubmit)}
          >
            {t("addAdmin.submit")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

InviteNewAdmin.getLayout = function getLayout(page: ReactElement) {
  return <Layout header={<Header />}>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default InviteNewAdmin;
