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
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getErrorMessage } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Teams } from "@/lib/Teams/definitions";
import { getTeams } from "@/lib/Teams/data";
import { toast } from "sonner";
import { createFixture } from "@/lib/Fixtures/actions";

const formSchema = z.object({
  away_team_id: z.string(),
  home_team_id: z.string(),
  match_date: z.date().optional(),
  match_info: z.object({
    competitionStage: z.string().min(1, "Stage is required"),
    league: z.string().min(1, "League is required"),
    leg: z.string().optional(),
  }),
  scores: z.object({
    home: z.number().min(0, "Home score must be 0 or greater").optional(),
    away: z.number().min(0, "Away score must be 0 or greater").optional(),
  }),
  status: z.enum(["active", "draft"]),
});

export default function create() {
  const [teams, setTeams] = useState<Teams[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      away_team_id: "",
      home_team_id: "",
      match_date: undefined,
      match_info: {
        competitionStage: "",
        league: "",
        leg: "",
      },
      scores: {
        home: 0,
        away: 0,
      },
      status: "active",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("away_team_id", values.away_team_id);
    formData.append("home_team_id", values.home_team_id);
    if (values.match_date) {
      formData.append("match_date", values.match_date.toISOString());
    }
    formData.append(
      "match_info[competitionStage]",
      values.match_info.competitionStage
    );
    formData.append("match_info[league]", values.match_info.league);
    if (values.match_info.leg) {
      formData.append("match_info[leg]", values.match_info.leg);
    }
    if (values.scores?.home) {
      formData.append("scores[home]", values.scores.home.toString());
    }
    if (values.scores?.away) {
      formData.append("scores[away]", values.scores.away.toString());
    }

    formData.append("status", values.status);

    try {
      await createFixture(formData);
      toast.success(`New Fixture saved as ${values.status}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveDraft = handleSubmit.bind(null, {
    ...form.getValues(),
    status: "draft",
  });

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      form.setValue("match_date", date);
    }
  }

  function handleTimeChange(type: "hour" | "minute", value: string) {
    const currentDate = form.getValues("match_date") || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }
    form.setValue("match_date", newDate);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new fixture</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="match_info.league"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">League</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. CAF Champions League"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="match_info.competitionStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Stage</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. First Preliminary Round or Round 2"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="match_info.leg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Leg</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g. First Leg or 1 of 2"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-16">
              <FormField
                control={form.control}
                name="home_team_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Home Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a home team to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can manage your teams in the{" "}
                      <Link href="/dashboard/teams" className="text-red-500">
                        Teams tab
                      </Link>
                      .
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="away_team_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Away Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an away team to display" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="match_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-bold">
                    Enter the date & time for this fixture
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
                          onSelect={handleDateSelect}
                          initialFocus
                        />
                        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                          <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                              {Array.from({ length: 24 }, (_, i) => i)
                                .reverse()
                                .map((hour) => (
                                  <Button
                                    key={hour}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      field.value.getHours() === hour
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                      handleTimeChange("hour", hour.toString())
                                    }
                                  >
                                    {hour}
                                  </Button>
                                ))}
                            </div>
                            <ScrollBar
                              orientation="horizontal"
                              className="sm:hidden"
                            />
                          </ScrollArea>
                          <ScrollArea className="w-64 sm:w-auto">
                            <div className="flex sm:flex-col p-2">
                              {Array.from({ length: 12 }, (_, i) => i * 5).map(
                                (minute) => (
                                  <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      field.value.getMinutes() === minute
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                      handleTimeChange(
                                        "minute",
                                        minute.toString()
                                      )
                                    }
                                  >
                                    {minute.toString().padStart(2, "0")}
                                  </Button>
                                )
                              )}
                            </div>
                            <ScrollBar
                              orientation="horizontal"
                              className="sm:hidden"
                            />
                          </ScrollArea>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
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
