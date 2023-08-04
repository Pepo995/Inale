import React, { useState } from "react";
import Typography from "@atoms/Typography";
import type { SidebarItemProps } from "@types";
import { cva } from "class-variance-authority";
import { cn } from "@utils";
import { useTranslate } from "@hooks";
import { useRouter } from "next/router";

const sidebarItemVariants = cva(
  "px-10 flex w-full justify-start py-1 md:py-2 hover:bg-gradient-to-r hover:from-tertiary/50 hover:to-15% hover:md:to-20% hover:border-s-8 hover:border-tertiary hover:ring-s-8 hover:ps-8",
  {
    variants: {
      selected: {
        true: "bg-gradient-to-r from-tertiary/50 to-15% box-border md:to-20% border-s-8 border-tertiary ring-s-8 ps-8",
      },
      loading: {
        true: "animate-bounce",
      },
    },
  }
);

const SidebarItem = ({ titleKey, path, Icon, selected }: SidebarItemProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className={cn(sidebarItemVariants({ selected, loading }))}
      onClick={async () => {
        setLoading(true);
        await router.push(path);
        setLoading(false);
      }}
      type="button"
    >
      <Typography
        variant="h3"
        weight="normal"
        color={selected || loading ? "bgTertiary" : "tertiary"}
        display="row"
        ellipsis
      >
        <Icon
          className={
            selected || loading
              ? "stroke-tertiary"
              : "stroke-tertiary-foreground"
          }
        />
        {t(titleKey)}
      </Typography>
    </button>
  );
};

export default SidebarItem;
