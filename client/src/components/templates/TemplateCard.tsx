"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Template } from "@/types/template";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const handleSelect = () => {
    router.push(`/create?template=${template._id}`);
  };
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <Image
        width={300}
        height={300}
        src={template.thumbnailUrl}
        alt={template.title}
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardTitle>{template.title}</CardTitle>
        <CardDescription>{template.occasionType}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleSelect} className="w-full">
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
