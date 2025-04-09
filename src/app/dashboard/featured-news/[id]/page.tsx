"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FeaturedNews } from "@/lib/FeaturedNews/definitions";
import { getArticle } from "@/lib/FeaturedNews/data";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { updateFeaturedNews } from "@/lib/FeaturedNews/actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

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
      (title) => title === undefined || title.length >= 1,
      "Cannot change title to blank"
    ),
  description: z
    .string()
    .optional()
    .refine(
      (title) => title === undefined || title.length >= 1,
      "Cannot change title to blank"
    ),
  status: z.enum(["active", "draft"]).optional(),
});

export default function Edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const [article, setArticle] = useState<FeaturedNews | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  useEffect(() => {
    const fetchArticle = async () => {
      setIsNotFound(false);
      try {
        const article: FeaturedNews | null = await getArticle(id);
        if (!article) {
          setIsNotFound(true);
        } else {
          setArticle(article);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchArticle();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: undefined,
      title: article?.title,
      description: article?.description,
      status: article?.status,
    },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    const formData = new FormData();

    if (values.title && values.title !== article?.title) {
      formData.append("title", values.title);
    }
    if (values.description && values.description !== article?.description) {
      formData.append("description", values.description);
    }
    if (values.picture) {
      formData.append("picture", values.picture);
    }
    if (values.status && values.status !== article?.status) {
      formData.append("status", values.status);
    }

    toast.info("Saving changes");
    try {
      await updateFeaturedNews(id, formData);
      toast.success("Article Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmitWithId = handleSubmit.bind(null, id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update news article</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitWithId)}
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
              // eslint-disable-next-line no-unused-vars
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
                  {article?.picture && (
                    <FormDescription>
                      <Image
                        src={article.picture}
                        alt="Article Picture"
                        width={128}
                        height={128}
                        className="w-20 h-20"
                      />
                    </FormDescription>
                  )}

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
