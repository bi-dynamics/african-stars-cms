"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  createFeaturedNews,
  getArticle,
  updateFeaturedNews,
} from "@/lib/featuredNews";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  picture: z
    .instanceof(File)
    .refine(
      (file) => file.size < 2000000,
      "Your picture must be less than 2MB."
    )
    .optional(),
  title: z
    .string()
    .optional()
    .refine(
      (title) => !title || title.length >= 1,
      "Cannot change title to blank"
    ),
  description: z
    .string()
    .optional()
    .refine(
      (title) => !title || title.length >= 1,
      "Cannot change title to blank"
    ),
  status: z.enum(["active", "draft"]),
});

export default function edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [article, setArticle] = useState<DocumentData | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const fetchedArticle = await getArticle(id);
        setArticle(fetchedArticle);
      } catch (error) {
        console.error("Error fetching article:", error);
        // Handle error state
      }
    };

    fetchArticle();
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: article
      ? {
          picture: undefined,
          title: article.title,
          description: article.description,
          status: article.status,
        }
      : {
          picture: undefined,
          title: "",
          description: "",
          status: "active",
        },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    console.log({ values });
    const formData = new FormData();
    if (values.title) {
      formData.append("title", values.title);
    }
    if (values.description) {
      formData.append("description", values.description);
    }
    if (values.picture) {
      formData.append("picture", values.picture);
    }
    if (values.status !== undefined) {
      formData.append("status", values.status);
    }

    try {
      if (article) {
        await updateFeaturedNews(id, formData);
      }
      router.push("/dashboard/featured-news");
    } catch (error) {
      // Handle submission error (e.g., display error message to the user)
      console.error("Error submitting featured news:", error);
    }
  };

  const handleUpdate = handleSubmit.bind(null, id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update news article</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Title</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={article?.title}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder={article?.description} {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="picture"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Picture</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder={
                        article?.picture ? "Change image" : "No file chosen"
                      }
                      {...fieldProps}
                      accept="image/*"
                      onChange={(event) =>
                        //checks if file exists and if first file is selected
                        onChange(event.target.files && event.target.files[0])
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    <Image
                      src={article?.picture}
                      alt="Article Picture"
                      width={128}
                      height={128}
                      className="w-20 h-20"
                    />
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />
            {article && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-bold">Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={article?.status}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="active" />
                          </FormControl>
                          <FormLabel className="font-normal">Active</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="draft" />
                          </FormControl>
                          <FormLabel className="font-normal">Draft</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      <strong>Drafts</strong> are not visible to users on your
                      app.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full disabled:bg-pink-400">
              Update
            </Button>
            <Link href="/dashboard/featured-news">
              <Button variant="ghost" className="w-full disabled:bg-pink-400">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
