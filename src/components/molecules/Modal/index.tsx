import React, { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@atoms/Dialog";
import { Button } from "@atoms/Button";

import { type VariantProps, cva } from "class-variance-authority";

const modalVariants = cva("", {
  variants: {
    variant: {
      tertiary: "tertiary",
      success: "success",
      destructive: "destructive",
      warning: "warning",
    },
  },
  defaultVariants: {
    variant: "tertiary",
  },
});

type ModalProps = {
  triggerButton: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  onConfirm?: () => string | void | boolean | Promise<boolean>;
} & VariantProps<typeof modalVariants>;

/**
 * @param {() => string | void | boolean | Promise<boolean>} onConfirm - Return true (asynchronously or not) in the onConfirm callback to prevent auto closing after confirm. Any other return value will autoclose the modal when confirming.
 */
const Modal = ({
  triggerButton,
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  showCancelButton = true,
  onConfirm,
  children,
  variant = "tertiary",
}: ModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="border-b pb-2">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="border-t pt-2">
          {showCancelButton && (
            <Button
              variant="cancel"
              onClick={() => {
                setOpen(false);
              }}
            >
              {cancelButtonText}
            </Button>
          )}
          {onConfirm && (
            <Button
              variant={variant}
              onClick={async () => {
                const res = await onConfirm();
                if (res !== true) setOpen(false);
              }}
            >
              {confirmButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { Modal };
