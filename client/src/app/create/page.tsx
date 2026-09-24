"use client";

import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  organization: z.string().min(1, "Organization is required"),
  district: z.string().optional(),
  occasion: z.string().min(1, "Please select an occasion"),
  headline: z.string().min(1, "Headline is required"),
});

export default function CreatePosterPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      designation: "",
      organization: "",
      district: "",
      occasion: "",
      headline: "",
    },
  });

  function onSubmit(values: any) {
    console.log({
      templateId,
      formData: values,
    });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="border shadow-sm">
          <CardHeader className="space-y-2 p-6">
            <CardTitle className="text-3xl font-bold">
              Create Your Poster
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Add your information and generate your poster.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form
              id="create-poster-form"
              onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="space-y-6">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="poster-name"
                        placeholder="Enter your name"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="designation"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-designation">
                        Designation
                      </FieldLabel>
                      <Input
                        {...field}
                        id="poster-designation"
                        placeholder="Enter designation"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="organization"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-organization">
                        Party / Organization
                      </FieldLabel>
                      <Input
                        {...field}
                        id="poster-organization"
                        placeholder="Enter organization"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="district"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-district">
                        Union / Thana / District
                      </FieldLabel>
                      <Input
                        {...field}
                        id="poster-district"
                        placeholder="Enter district"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="occasion"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-occasion">
                        Occasion
                      </FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger
                          id="poster-occasion"
                          aria-invalid={fieldState.invalid}
                          className="w-full">
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="victory">বিজয় দিবস</SelectItem>
                          <SelectItem value="tribute">শোক / স্মরণ</SelectItem>
                          <SelectItem value="campaign">
                            নির্বাচনী প্রচার
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="headline"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="poster-headline">
                        Headline
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="poster-headline"
                        placeholder="Enter Bangla headline"
                        rows={3}
                        aria-invalid={fieldState.invalid}
                        className="resize-none"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Button
                  type="submit"
                  form="create-poster-form"
                  className="w-full">
                  Continue
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
