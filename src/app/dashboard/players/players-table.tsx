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
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Players } from "@/lib/Players/definitions";
import Player from "./player";
import { getPlayers } from "@/lib/Players/data";
import { deletePlayer } from "@/lib/Players/actions";

export default function PlayersTable() {
  const [players, setPlayers] = useState<Players[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more pages
  const [currentPage, setCurrentPage] = useState(1);
  const hasPrevious = currentPage > 1;
  const [refresh, setRefresh] = useState(false);

  const fetchPlayers = useCallback(
    async (nextPage: boolean = false, prevPage: boolean = false) => {
      setIsLoading(true);

      let players;

      if (nextPage) {
        players = await getPlayers(nextPage, false);
      } else if (prevPage) {
        players = await getPlayers(false, prevPage);
      } else {
        players = await getPlayers();
      }
      if (players !== undefined) {
        setPlayers(players); // replace existing articles with new ones

        // Check for hasPrevious and hasMore based on the number of articles fetched
        setHasMore(players.length === 10);
      } else {
        console.error("Players returned undefined");
      }

      setIsLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchPlayers();
  }, [refresh, fetchPlayers]);

  const loadMorePlayers = async () => {
    const newCurrentPage = currentPage + 1;
    setCurrentPage(newCurrentPage);
    fetchPlayers(true, false);
  };

  const loadPreviousPlayers = async () => {
    const newCurrentPage = currentPage - 1;
    setCurrentPage(newCurrentPage);
    fetchPlayers(false, true);
  };

  const handleDeletePlayer = async (id: string) => {
    toast.info("Deleting player...");
    try {
      const result = await deletePlayer(id);
      if (result.success) {
        toast.success("Player deleted");
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
          <CardTitle>Players</CardTitle>
          <CardDescription>Manage your players here</CardDescription>
        </div>
        <Link href="/dashboard/players/create">
          <Button>
            <PlusCircle />
            Add New Player
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Picture</TableHead>
              <TableHead>First name</TableHead>
              <TableHead>Last name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          {isLoading && <p>Loading</p>}
          <TableBody>
            {players.map((player) => (
              <Player
                key={player.id}
                player={player}
                onDelete={handleDeletePlayer}
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
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadPreviousPlayers}
              disabled={isLoading || !hasPrevious}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMorePlayers}
              disabled={isLoading || !hasMore}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
