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
import { PlusCircle } from "lucide-react";
import Team from "./team";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getTeams } from "@/lib/Teams/data";
import { Teams } from "@/lib/Teams/definitions";
import { deleteTeam } from "@/lib/Teams/actions";

export default function TeamsTable() {
  const [teams, setTeams] = useState<Teams[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [refresh]);

  const fetchTeams = async () => {
    if (isLoading) return;

    setIsLoading(true);

    const teams = await getTeams();

    if (teams !== undefined) {
      setTeams(teams);
    } else {
      console.error("Teams returned undefined");
    }

    setIsLoading(false);
  };

  const handleDeleteTeam = async (id: string) => {
    toast.info("Deleting team");
    try {
      const result = await deleteTeam(id);
      if (result.success) {
        toast.success("Team deleted");
        setRefresh((prev) => !prev);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occured. " + error);
    }
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
              <Team key={team.id} team={team} onDelete={handleDeleteTeam} />
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
