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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateFixture } from "@/lib/Fixtures/actions";
import { getFixture } from "@/lib/Fixtures/data";
import { Fixtures } from "@/lib/Fixtures/definitions";
import { getTeams } from "@/lib/Teams/data";
import { Teams } from "@/lib/Teams/definitions";
import { cn, getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  away_team_id: z.string().min(1, "Away team is required").optional(),
  home_team_id: z.string().min(1, "Home team is required").optional(),
  match_date: z.date().optional(),
  match_info: z.object({
    competitionStage: z.string().min(1, "Stage is required").optional(),
    league: z.string().min(1, "League is required").optional(),
    leg: z.string().optional().optional(),
  }),
  scores: z.object({
    home: z.number().min(0, "Home score must be 0 or greater").optional(),
    away: z.number().min(0, "Away score must be 0 or greater").optional(),
  }),
  status: z.enum(["active", "draft"]).optional(),
});

export default function page({ params }: { params: { id: string } }) {
  const { id } = params;
  const [fixture, setFixture] = useState<Fixtures | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [teams, setTeams] = useState<Teams[]>([]);

  useEffect(() => {
    const fetchFixture = async () => {
      setIsNotFound(false);
      try {
        const fixture: Fixtures | null = await getFixture(id);
        if (!fixture) {
          setIsNotFound(true);
        } else {
          setFixture(fixture);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await getTeams();
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchFixture();
    fetchTeams();
  }, [id]);

  if (isNotFound) {
    notFound();
  }

  const getTeamName = (teamId: string | undefined): string => {
    if (!teamId || !teams) return "";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "";
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      away_team_id: fixture?.away_team_id,
      home_team_id: fixture?.home_team_id,
      match_date: fixture?.match_date?.toDate() || undefined,
      match_info: {
        competitionStage: fixture?.match_info.competitionStage,
        league: fixture?.match_info.league,
        leg: fixture?.match_info.leg,
      },
      scores: {
        home: fixture?.scores?.home,
        away: fixture?.scores?.away,
      },
      status: fixture?.status,
    },
  });

  const handleSubmit = async (
    id: string,
    values: z.infer<typeof formSchema>
  ) => {
    const formData = new FormData();

    if (values.away_team_id && values.away_team_id !== fixture?.away_team_id) {
      formData.append("away_team_id", values.away_team_id);
    }
    if (values.home_team_id && values.home_team_id !== fixture?.home_team_id) {
      formData.append("home_team_id", values.home_team_id);
    }
    if (
      values.match_date &&
      values.match_date !== fixture?.match_date.toDate()
    ) {
      formData.append("match_date", values.match_date.toISOString());
    }
    if (
      values.match_info.competitionStage &&
      values.match_info.competitionStage !==
        fixture?.match_info.competitionStage
    ) {
      formData.append(
        "match_info[competitionStage]",
        values.match_info.competitionStage
      );
    }
    if (
      values.match_info.league &&
      values.match_info.league !== fixture?.match_info.league
    ) {
      formData.append("match_info[league]", values.match_info.league);
    }
    if (
      values.match_info.leg &&
      values.match_info.leg !== fixture?.match_info.leg
    ) {
      formData.append("match_info[leg]", values.match_info.leg);
    }
    if (values.scores?.home && values.scores.home !== fixture?.scores?.home) {
      formData.append("scores[home]", values.scores.home.toString());
    }
    if (values.scores?.away && values.scores.away !== fixture?.scores?.away) {
      formData.append("scores[away]", values.scores.away.toString());
    }

    if (values.status && values.status !== fixture?.status)
      formData.append("status", values.status);

    toast.info("Saving changes");
    try {
      console.log(values);
      await updateFixture(id, formData);
      toast.success("Fixture Updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSubmitWithId = handleSubmit.bind(null, id);

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
        <CardTitle>Update fixture</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitWithId)}
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
                      placeholder={fixture?.match_info.league}
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
                      placeholder={fixture?.match_info.competitionStage}
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
                      placeholder={fixture?.match_info.leg}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-16 bg-gray-50 p-8">
              <FormField
                control={form.control}
                name="home_team_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Home Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={fixture?.home_team_id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={getTeamName(fixture?.home_team_id)}
                          />
                        </SelectTrigger>
                      </FormControl>
                      {fixture?.home_team?.name}
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            disabled={form.watch("away_team_id") === team.id}
                          >
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can manage your teams in the{" "}
                      <Link href="/dashboard/teams" className="text-red-500">
                        Teams
                      </Link>{" "}
                      tab.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-center items-center">
                <FormField
                  control={form.control}
                  name="scores.home"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={fixture?.scores?.home.toString()}
                          {...field}
                          className="text-4xl font-bold"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-2xl font-bold">:</span>
                <FormField
                  control={form.control}
                  name="scores.home"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={fixture?.scores?.away.toString()}
                          {...field}
                          className="text-4xl font-bold"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="away_team_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">Away Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={fixture?.away_team_id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={getTeamName(fixture?.away_team_id)}
                          />
                        </SelectTrigger>
                      </FormControl>
                      {fixture?.away_team?.name}
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem
                            key={team.id}
                            value={team.id}
                            defaultValue={fixture?.away_team_id}
                            disabled={form.watch("home_team_id") === team.id}
                          >
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
                        ) : fixture?.match_date ? (
                          <span>
                            {format(
                              fixture?.match_date.toDate(),
                              "MM/dd/yyy HH:mm"
                            )}
                          </span>
                        ) : (
                          "TBA"
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
                  <FormDescription>
                    If a date is not set, the fixture date will be{" "}
                    <strong>TBA</strong>
                  </FormDescription>
                </FormItem>
              )}
            />
            {fixture && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-bold">Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={fixture?.status}
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
            <Link href="/dashboard/fixtures-and-results">
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
