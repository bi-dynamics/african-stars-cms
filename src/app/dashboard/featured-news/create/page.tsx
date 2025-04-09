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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createFeaturedNews } from "@/lib/FeaturedNews/actions";
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
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "draft"]),
});

export default function create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      picture: undefined,
      title: "",
      description: "",
      status: "active",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    if (values.picture) {
      formData.append("picture", values.picture);
    }
    formData.append("status", values.status);

    toast.info(
      values.status === "active" ? "Publishing article" : "Saving as draft"
    );
    try {
      await createFeaturedNews(formData);
      toast.success(`New Article saved as ${values.status}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit((values) => {
      handleSubmit({ ...values, status: "draft" });
    })();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new article</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Title</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
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
                    <Textarea
                      placeholder="Write a description for your article"
                      className=""
                      {...field}
                    />
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
                      {...fieldProps}
                      accept="image/*"
                      onChange={(event) =>
                        //checks if file exists and if first file is selected
                        onChange(event.target.files && event.target.files[0])
                      }
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full disabled:bg-pink-400">
              Publish
            </Button>
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="w-full disabled:bg-pink-400"
            >
              Save as draft
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
