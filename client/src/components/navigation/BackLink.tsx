import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: "outline" }), className)}>
      <ArrowLeft data-icon="inline-start" />
      {children}
    </Link>
  );
}
