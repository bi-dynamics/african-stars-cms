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
import Link from "next/link";
import { createTeam } from "@/lib/Teams/actions";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size < 2000000,
      "Your picture must be less than 2MB."
    )
    .optional(),
  name: z.string().min(1, "Team name is required"),
});

export default function Create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      name: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.image) {
      formData.append("picture", values.image);
    }
    try {
      await createTeam(formData);
      toast.success("New team created");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new team</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Team Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              // eslint-disable-next-line no-unused-vars
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Team Logo</FormLabel>
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

            <Link href="/dashboard/teams">
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
