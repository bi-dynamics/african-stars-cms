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
import { updatePlayer } from "@/lib/Players/actions";
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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  position: z
    .enum(["Defender", "Forward", "Goalkeeper", "Midfielder"])
    .optional(),
  current_age: z.number().optional(),
  height: z.number().optional(),
  foot: z.enum(["left", "right"]).optional(),
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
  number: z.number().optional(),
  nationality: z.string().optional(),
  date_of_birth: z.date().optional(),
  joined_club: z.date().optional(),
  status: z.enum(["active", "draft"]).optional(),
});

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [player, setPlayer] = useState<Players | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      setIsNotFound(false);
      try {
        const player: Players | null = await getPlayer(id);
        if (!player) {
          setIsNotFound(true);
        } else {
          setPlayer(player);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPlayer();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: player?.firstName,
      lastName: player?.lastName,
      position: player?.position,
      current_age: player?.current_age,
      height: player?.height ? Number(player.height) : undefined,
      number: player?.number ? Number(player.number) : undefined,
      foot: player?.foot,
      biography: player?.biography,
      picture: undefined,
      detail_picture: undefined,
      nationality: player?.nationality,
      date_of_birth: player?.date_of_birth?.toDate() || undefined,
      joined_club: player?.joined_club?.toDate() || undefined,
      status: player?.status,
    },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    const formData = new FormData();

    if (values.firstName && values.firstName !== player?.firstName) {
      formData.append("firstName", values.firstName);
    }
    if (values.lastName && values.lastName !== player?.lastName) {
      formData.append("lastName", values.lastName);
    }
    if (values.number && values.number !== Number(player?.number)) {
      formData.append("number", values.number.toString());
    }
    if (values.picture) {
      formData.append("picture", values.picture);
    }
    if (values.detail_picture) {
      formData.append("detail_picture", values.detail_picture);
    }
    if (values.position && values.position !== player?.position) {
      formData.append("position", values.position);
    }
    if (values.current_age && values.current_age !== player?.current_age) {
      formData.append("current_age", values.current_age.toString());
    }
    if (values.height && values.height !== player?.height) {
      formData.append("height", values.height.toString());
    }
    if (values.foot && values.foot !== player?.foot) {
      formData.append("foot", values.foot);
    }
    if (values.biography && values.biography !== player?.biography) {
      formData.append("biography", values.biography);
    }
    if (values.nationality && values.nationality !== player?.nationality) {
      formData.append("nationality", values.nationality);
    }
    if (
      values.joined_club &&
      values.joined_club !== player?.joined_club.toDate()
    ) {
      formData.append("joined_date", values.joined_club.toISOString());
    }
    if (
      values.date_of_birth &&
      values.date_of_birth !== player?.date_of_birth.toDate()
    ) {
      formData.append("date_of_birth", values.date_of_birth.toISOString());
    }
    if (values.status && values.status !== player?.status)
      formData.append("status", values.status);

    toast.info("Saving changes");
    try {
      await updatePlayer(id, formData);
      toast.success("Player Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmitWithId = handleSubmit.bind(null, id);

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
        <CardTitle>Update Player</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitWithId)}
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
                    <FormDescription>
                      {player && player.picture && (
                        <Image
                          src={player?.picture}
                          alt="Player Cover Picture"
                          width={128}
                          height={128}
                          className="w-20 h-20"
                        />
                      )}
                      {player && player.picture
                        ? "Current player cover picture"
                        : "Upload a cover picture"}
                    </FormDescription>

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
                    <FormDescription>
                      {player && player.detail_picture && (
                        <Image
                          src={player?.detail_picture}
                          alt="Player Detail View Picture"
                          width={128}
                          height={128}
                          className="w-20 h-20"
                        />
                      )}
                      {player && player.detail_picture
                        ? "Current player detail view picture"
                        : "Upload a detail view picture"}
                    </FormDescription>

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
                      <Input
                        type="text"
                        placeholder={player?.firstName}
                        {...field}
                      />
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
                      <Input
                        type="text"
                        placeholder={player?.lastName}
                        {...field}
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
                name="current_age"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={player?.current_age?.toString()}
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
                        type="number"
                        placeholder={player?.height?.toString()}
                        {...field}
                        className="text-4xl font-bold"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        step="0.01"
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
                    <Input
                      type="text"
                      placeholder={player?.nationality}
                      {...field}
                    />
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
                        ) : player?.date_of_birth ? (
                          <span>
                            {format(
                              player?.date_of_birth.toDate(),
                              "MM/dd/yyy HH:mm"
                            )}
                          </span>
                        ) : (
                          "None"
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
                    <Textarea placeholder={player?.biography} {...field} />
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
                          placeholder={player?.number?.toString()}
                          {...field}
                          className="text-4xl font-bold"
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
                        defaultValue={player?.position}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={player?.position} />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem
                              key={position}
                              value={position}
                              disabled={
                                form.watch("position") === player?.position
                              }
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
                        defaultValue={player?.foot}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={player?.foot} />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {footOptions.map((foot) => (
                            <SelectItem
                              key={foot}
                              value={foot}
                              disabled={form.watch("foot") === player?.foot}
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
                        Date when the {player?.firstName || "player"} joined the
                        club
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
                            ) : player?.joined_club ? (
                              <span>
                                {format(
                                  player?.joined_club.toDate(),
                                  "MM/dd/yyy HH:mm"
                                )}
                              </span>
                            ) : (
                              "None"
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
            {player && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-bold">Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={player?.status}
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
            <Link href="/dashboard/players">
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
