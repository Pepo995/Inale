import React, { type ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@atoms/Card";

import Image from "next/image";

type ImageProps = {
  src: string;
  alt: string;
  width: number;
  height?: number;
};

type CardWithImage = {
  image: ImageProps;
  title: string;
  description: string;
  footer: ReactNode;
};

const CardWithImage = ({
  footer,
  image,
  title,
  description,
}: CardWithImage) => (
  <Card>
    <CardHeader className="p-0">
      <Image
        alt={image.alt}
        src={image.src}
        className="w-full rounded-t-lg pb-3"
        width={image.width}
        height={image.height ?? 0}
      />
      <CardTitle className="px-6 text-gray-400">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-8 text-gray-600">{description}</CardContent>
    <CardFooter>{footer}</CardFooter>
  </Card>
);

export default CardWithImage;
