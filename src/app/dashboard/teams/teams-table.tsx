"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import Team from "./team";
import { FeaturedNewsData, getFeaturedNews } from "@/lib/featuredNews";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getTeams, TeamsData } from "@/lib/teams";

export default function TeamsTable() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
    console.log("pageloaded");
  }, []);

  const fetchTeams = async () => {
    if (isLoading) return;

    setIsLoading(true);

    let teams = await getTeams();

    if (teams !== undefined) {
      setTeams(teams);
    } else {
      console.error("Teams returned undefined");
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Manage your teams here</CardDescription>
        </div>
        <Link href="/dashboard/teams/create">
          <Button>
            <PlusCircle />
            Add New Team
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Image</TableHead>
              <TableHead>Team Name</TableHead>

              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <Team
                key={team.id}
                team={team}
                // onDelete={deleteFeaturedNews}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            {/* Showing <strong>1 - 5</strong> of <strong>12</strong> Articles */}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
