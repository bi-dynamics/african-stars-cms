"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";
import { createFanHighlights } from "@/lib/FanHighlights/actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  src: z.string().min(1, "Video link is required"),
  status: z.enum(["active", "draft"]),
});

export default function create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      src: "",
      status: "active",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log({ values });
    const formData = new FormData();
    formData.append("src", values.src);
    formData.append("status", values.status);

    toast.info(
      values.status === "active" ? "Publishing highlight" : "Saving as draft"
    );
    try {
      await createFanHighlights(formData);
      toast.success(`Fan Highlight saved as ${values.status}`);
    } catch (error) {
      console.error(getErrorMessage(error));
    }
  };

  const handleSaveDraft = handleSubmit.bind(null, {
    ...form.getValues(),
    status: "draft",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a new highlight </CardTitle>
        <CardDescription>
          Add a link to the youtube video you would like to add.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="src"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Link to YouTube Video
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full active:bg-red-600">
              Publish
            </Button>
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="w-full active:bg-red-600"
            >
              Save as draft
            </Button>
            <Link href="/dashboard/fan-highlights">
              <Button variant="ghost" className="w-full active:bg-red-600">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
