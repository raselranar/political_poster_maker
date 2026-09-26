"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { createPoster, uploadPhotos, getPoster } from "@/lib/api";
import Image from "next/image";
import { toast } from "@/components/ui/toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  organization: z.string().optional(),
  district: z.string().min(1, "District is required"),
  occasion: z.enum(["victory", "tribute", "campaign"], {
    message: "Please select an occasion",
  }),
  headline: z.string().min(1, "Headline is required"),
});
export type FormValues = z.infer<typeof formSchema>;

export default function CreatePage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      designation: "",
      organization: "",
      district: "",
      occasion: "victory",
      headline: "",
    },
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(event.target.files || []);

    if (selectedFiles.length > 3) {
      setError("You can select a maximum of 3 photos.");
      return;
    }

    setError("");
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const onSubmit = async (values: FormValues) => {
    setError("");
    setGeneratedImage(null);

    if (!templateId) {
      setError("Template is missing.");
      return;
    }

    if (files.length < 1) {
      setError("Please select at least one photo.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before creating a poster.");
      toast.add({
        title: "Please login before creating a poster.",
      });
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading photos...");

      // Upload photos to Cloudinary
      const uploadResult = await uploadPhotos(files, token);
      const photoUrls = uploadResult.images.map((image) => image.secure_url);

      // Create poster
      setStatus("Starting poster generation...");
      const posterResult = await createPoster(
        {
          templateId,
          ...values,
          photoUrls,
        },
        token,
      );

      const posterId = posterResult.poster.id;

      // Step 3: Poll poster status
      setStatus("Generating your poster...");
      let attempts = 0;

      const poll = async () => {
        attempts++;

        const result = await getPoster(posterId, token);
        const poster = result.poster;

        if (poster.status === "completed") {
          setGeneratedImage(poster.generatedImageUrl);
          setStatus("Poster generated successfully.");
          setLoading(false);
          return;
        }

        if (poster.status === "failed") {
          throw new Error(poster.errorMessage || "Poster generation failed.");
        }

        if (attempts >= 30) {
          throw new Error(
            "Poster generation is taking too long. Please check your poster history later.",
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return poll();
      };

      await poll();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
      setStatus("");
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <main className="p-6 ">
      <Card className="border max-w-xl mx-auto shadow-sm">
        <CardHeader className="space-y-2 p-6">
          <CardTitle className="text-3xl font-bold">Create Poster</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Add your information and photos.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {/* <AlertTitle>Error</AlertTitle> */}
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form id="create-poster-form" onSubmit={form.handleSubmit(onSubmit)}>
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
                      placeholder="Enter name"
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
                      Organization
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
                    <FieldLabel htmlFor="poster-district">District</FieldLabel>
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
                    <FieldLabel htmlFor="poster-occasion">Occasion</FieldLabel>
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
                    <FieldLabel htmlFor="poster-headline">Headline</FieldLabel>
                    <Input
                      {...field}
                      id="poster-headline"
                      placeholder="Enter headline"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="poster-photos">Photos</FieldLabel>
                <Input
                  id="poster-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />
                <FieldDescription>
                  Select 1–3 photos. Maximum 5 MB each.
                </FieldDescription>
              </Field>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <Image
                      width={300}
                      height={300}
                      key={preview}
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              <Button
                type="submit"
                form="create-poster-form"
                disabled={loading}
                className="w-full">
                {loading ? status || "Generating..." : "Generate Poster"}
              </Button>
            </FieldGroup>
          </form>

          {status && !generatedImage && (
            <div className="mt-8 rounded-lg border p-5 text-center">
              <p className="font-medium">{status}</p>
              {loading && (
                <p className="mt-2 text-sm text-gray-500">Please wait...</p>
              )}
            </div>
          )}

          {generatedImage && (
            <div className="mt-10">
              <h2 className="mb-4 text-2xl font-bold">Your Poster</h2>
              <Image
                width={300}
                height={300}
                src={generatedImage}
                alt="Generated poster"
                className="mx-auto w-full max-w-xl rounded-lg shadow-lg"
              />
              <a
                href={generatedImage}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ className: "mt-6 w-full" })}>
                Open / Download Poster
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
