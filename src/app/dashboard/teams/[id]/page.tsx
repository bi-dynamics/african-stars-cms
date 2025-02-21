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
import { getTeam, updateTeam } from "@/lib/teams";

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

export default function edit({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [team, setTeam] = useState<DocumentData | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const fetchedTeam = await getTeam(id);
        setTeam(fetchedTeam);
      } catch (error) {
        console.error("Error fetching team:", error);
        // Handle error state
      }
    };

    fetchTeam();
  }, [id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: team
      ? {
          image: team.image,
          name: team.name,
        }
      : {
          image: undefined,
          name: "",
        },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    console.log({ values });
    const formData = new FormData();
    if (values.name) {
      formData.append("name", values.name);
    }

    if (values.image) {
      formData.append("image", values.image);
    }

    try {
      if (team) {
        await updateTeam(id, formData);
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
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="font-bold">Team Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      placeholder={
                        team?.image ? "Change image" : "No file chosen"
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
                    {team && (
                      <Image
                        src={team?.image_url}
                        alt="Team Picture"
                        width={128}
                        height={128}
                        className="w-20 h-20"
                      />
                    )}
                    Current team logo
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
