import { UploadIcon } from "lucide-react";
import { usePresignedUpload } from "next-s3-upload";
import React from "react";
import { Controller } from "react-hook-form";

export interface FileInputProps {
  id: string;
  name: string;
  acceptedExtensions?: string;
  uploadFileText: string;
  onFileUploaded: (url: string) => void;
  onError?: () => void;
}

const FileInput = ({
  id,
  name,
  acceptedExtensions = "image/png, image/jpeg",
  uploadFileText,
  onFileUploaded,
  onError,
}: FileInputProps) => {
  const { uploadToS3 } = usePresignedUpload();

  return (
    <Controller
      name={name}
      render={({ field: { onChange } }) => (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label
            htmlFor={id}
            className="flex w-full cursor-pointer justify-center rounded-md border border-dashed bg-background p-3 text-center text-sm ring-offset-background file:border-0"
          >
            <UploadIcon size={14} className="my-auto mr-2" />
            {uploadFileText}
          </label>
          <input
            type="file"
            id={id}
            className="hidden"
            accept={acceptedExtensions}
            onChange={async (event) => {
              if (!event.target.files?.[0]) {
                if (onError) onError();
                return;
              }
              const innerFile = event.target.files[0];
              const { url } = await uploadToS3(innerFile);
              onChange(url);
              onFileUploaded(url);
            }}
          />
        </div>
      )}
    />
  );
};

export default FileInput;
