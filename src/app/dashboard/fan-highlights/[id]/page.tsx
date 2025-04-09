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
import { updateFanHighlights } from "@/lib/FanHighlights/actions";
import { getFanHighlight } from "@/lib/FanHighlights/data";
import { FanHighlights } from "@/lib/FanHighlights/definitions";
import { getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  src: z
    .string()
    .min(10, "Please use a youtube linnk")
    .optional()
    .refine(
      (link) => link === undefined || link.length >= 10,
      "Please use a youtube link"
    ),
  status: z.enum(["active", "draft"]).optional(),
});

export default function Edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const [highlight, setHighlight] = useState<FanHighlights | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchHighlight = async () => {
      setIsNotFound(false);
      try {
        const highlight: FanHighlights | null = await getFanHighlight(id);
        if (!highlight) {
          setIsNotFound(true);
        } else {
          setHighlight(highlight);
        }
      } catch (error) {
        console.error("Error fetching highlight:", error);
      }
    };

    fetchHighlight();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      src: highlight?.src,
      status: highlight?.status,
    },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    console.log({ values });
    const formData = new FormData();
    if (values.src) {
      formData.append("src", values.src);
    }

    if (values.status) {
      formData.append("status", values.status);
    }

    toast.info("Saving changes");
    try {
      await updateFanHighlights(id, formData);
      toast.success("Highlight Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
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
