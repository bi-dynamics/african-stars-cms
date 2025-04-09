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
import { notFound } from "next/navigation";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Teams } from "@/lib/Teams/definitions";
import { getTeam } from "@/lib/Teams/data";
import { updateTeam } from "@/lib/Teams/actions";
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
  name: z.string().min(1, "Team name is required").optional(),
});

export default function Edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const [team, setTeam] = useState<Teams | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      setIsNotFound(false);
      try {
        const team: Teams | null = await getTeam(id);
        if (!team) {
          setIsNotFound(true);
        } else {
          setTeam(team);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeam();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: undefined,
      name: team?.name,
    },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    const formData = new FormData();
    if (values.name) {
      formData.append("name", values.name);
    }
    if (values.image) {
      formData.append("image", values.image);
    }

    toast.info("Saving changes");
    try {
      await updateTeam(id, formData);
      toast.success("Team Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUpdate = handleSubmit.bind(null, id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update team</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Team Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder={team?.name} {...field} />
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
                  <FormDescription>
                    {team && team.image_url && (
                      <Image
                        src={team?.image_url}
                        alt="Team Picture"
                        width={128}
                        height={128}
                        className="w-20 h-20"
                      />
                    )}
                    {team && team.image_url
                      ? "Current team logo"
                      : "Upload a logo"}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

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
