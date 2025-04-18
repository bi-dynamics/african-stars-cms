"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPlayer, updatePlayer } from "@/lib/Players/actions";
import { getPlayer } from "@/lib/Players/data";
import { Players } from "@/lib/Players/definitions";
import { cn, getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.enum(["Defender", "Forward", "Goalkeeper", "Midfielder"]),
  current_age: z.number().min(16, "Player age is required"),
  height: z.number().optional(),
  foot: z.enum(["left", "right"]),
  biography: z.string().optional(),
  picture: z
    .instanceof(File)
    .refine(
      (file) => file.size < 2000000,
      "Your picture must be less than 2MB."
    )
    .optional(),
  detail_picture: z
    .instanceof(File)
    .refine(
      (file) => file.size < 2000000,
      "Your picture must be less than 2MB."
    )
    .optional(),
  number: z.number().min(0, "Player number is required"),
  nationality: z.string().optional(),
  date_of_birth: z.date(),
  joined_club: z.date(),
  status: z.enum(["active", "draft"]),
});

export default function Create() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      picture: undefined,
      detail_picture: undefined,
      number: 0,
      position: "Defender",
      current_age: 0,
      height: 0,
      foot: "right",
      biography: "",
      nationality: "",
      date_of_birth: new Date(),
      joined_club: new Date(),
      status: "active",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();

    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("number", values.number.toString());
    formData.append("position", values.position ?? "Defender");
    if (values.current_age) {
      formData.append("current_age", values.current_age.toString());
    }
    if (values.height) {
      formData.append("height", values.height.toString());
    }
    formData.append("foot", values.foot ?? "right");
    if (values.biography) {
      formData.append("biography", values.biography);
    }

    if (values.picture) {
      formData.append("picture", values.picture);
    }
    if (values.detail_picture) {
      formData.append("detail_picture", values.detail_picture);
    }

    if (values.nationality) {
      formData.append("nationality", values.nationality);
    }
    if (values.date_of_birth) {
      formData.append("date_of_birth", values.date_of_birth.toISOString());
    }
    if (values.joined_club) {
      formData.append("joined_club", values.joined_club.toISOString());
    }
    formData.append("status", values.status);

    try {
      await createPlayer(formData);
      toast.success(`New Player saved as ${values.status}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveDraft = handleSubmit.bind(null, {
    ...form.getValues(),
    status: "draft",
  });

  function handleJoinedClubDateSelect(date: Date | undefined) {
    if (date) {
      form.setValue("joined_club", date);
    }
  }
  function handleDOBDateSelect(date: Date | undefined) {
    if (date) {
      form.setValue("date_of_birth", date);
    }
  }

  const positions: Players["position"][] = [
    "Defender",
    "Midfielder",
    "Forward",
    "Goalkeeper",
  ];
  const footOptions: Players["foot"][] = ["left", "right"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new Player</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <div className="flex gap-16">
              <FormField
                control={form.control}
                name="picture"
                // eslint-disable-next-line no-unused-vars
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Cover Picture</FormLabel>
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
              <FormField
                control={form.control}
                name="detail_picture"
                // eslint-disable-next-line no-unused-vars
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">
                      Detail View Picture
                    </FormLabel>
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
            </div>
            <div className="flex gap-16">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">First Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Last Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-16">
              <FormField
                control={form.control}
                name="current_age"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="26"
                        {...field}
                        className="text-4xl font-bold"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Height</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="1.75"
                        {...field}
                        className="text-4xl font-bold"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      <strong>Height</strong> is in meters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nationality</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Namibian" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">
                    Player Date Of Birth
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MM/dd/yyyy HH:mm")
                        ) : (
                          <span>MM/DD/YYYY HH:mm</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="sm:flex">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={handleDOBDateSelect}
                          initialFocus
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short bio about the player"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardTitle className="font-bold">Club Details</CardTitle>
            <div className="flex-col space-y-8 gap-16 bg-gray-50 p-8">
              <div className="flex gap-8">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Player Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="11"
                          {...field}
                          className="text-4xl font-bold"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue="Defender"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Defender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem
                              key={position}
                              value={position}
                              disabled={form.watch("position") === position}
                            >
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foot"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-bold">Foot</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue="right"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="right" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {footOptions.map((foot) => (
                            <SelectItem
                              key={foot}
                              value={foot}
                              disabled={form.watch("foot") === foot}
                            >
                              {foot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="joined_club"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-bold">
                        Date when the player joined the club
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM/dd/yyyy HH:mm")
                            ) : (
                              <span>MM/DD/YYYY HH:mm</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="sm:flex">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={handleJoinedClubDateSelect}
                              initialFocus
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Publish
            </Button>
            <Button
              type="button"
              onClick={handleSaveDraft}
              variant="outline"
              className="w-full"
            >
              Save as draft
            </Button>
            <Link href="/dashboard/players">
              <Button variant="ghost" className="w-full">
                Cancel
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
