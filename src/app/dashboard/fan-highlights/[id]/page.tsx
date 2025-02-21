"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getFanHighlight, updateFanHighlights } from "@/lib/fanHighlights";
import { zodResolver } from "@hookform/resolvers/zod";
import { DocumentData } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  src: z.string().min(1, "Video link is required"),
  status: z.enum(["active", "draft"]),
});

export default function edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [highlight, setHighlight] = useState<DocumentData | null>(null);

  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const fetchedHighlight = await getFanHighlight(id);
        setHighlight(fetchedHighlight);
      } catch (error) {
        console.error("Error fetching highlight:", error);
      }
    };

    fetchHighlight();
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: highlight
      ? {
          src: highlight.src,
          status: highlight.title,
        }
      : {
          src: "",
          status: "active",
        },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    console.log({ values });
    const formData = new FormData();
    formData.append("src", values.src);
    formData.append("status", values.status);

    try {
      if (highlight) {
        await updateFanHighlights(id, formData);
      }
      router.push("/dashboard/fan-highlights");
    } catch (error) {
      console.error("Error submitting fan highlight:", error);
    }
  };

  const handleUpdate = handleSubmit.bind(null, id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update fan highlight</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="src"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Link to YouTube video
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={highlight?.src}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            {highlight && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-bold">Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={highlight.status}
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
            <Button type="submit" className="w-full active:bg-red-500">
              Update
            </Button>
            <Link href="/dashboard/fan-highlights">
              <Button variant="ghost" className="w-full active:bg-red-500">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
