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
import Fixture from "./fixture";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteFixture } from "@/lib/Fixtures/actions";
import { Fixtures } from "@/lib/Fixtures/definitions";
import { getFixtures } from "@/lib/Fixtures/data";

export default function FixturesTable() {
  const [fixtures, setFixtures] = useState<Fixtures[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more pages
  const [hasPrevious, setHasPrevious] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchFixtures();
  }, [refresh]);

  const fetchFixtures = async (
    nextPage: boolean = false,
    prevPage: boolean = false,
    currentPage: number = 1
  ) => {
    if (isLoading) return;

    setIsLoading(true);

    let fixtures;
    if (nextPage) {
      fixtures = await getFixtures(nextPage, false);
    } else if (prevPage) {
      fixtures = await getFixtures(false, prevPage);
    } else {
      fixtures = await getFixtures();
    }
    if (fixtures !== undefined) {
      setFixtures(fixtures); // replace existing articles with new ones

      // Check for hasPrevious and hasMore based on the number of articles fetched

      setHasPrevious(currentPage > 1);
      setHasMore(fixtures.length === 10);
    } else {
      console.error("Featured news returned undefined");
    }

    setIsLoading(false);
  };

  const loadMoreFixtures = async () => {
    const newCurrentPage = currentPage + 1;
    setCurrentPage(newCurrentPage);
    fetchFixtures(true, false, newCurrentPage);
  };

  const loadPreviousFixtures = async () => {
    const newCurrentPage = currentPage - 1;
    setCurrentPage(newCurrentPage);
    fetchFixtures(false, true, newCurrentPage);
  };

  const handleDeleteFixture = async (id: string) => {
    toast.info("Deleting fixture");
    try {
      const result = await deleteFixture(id);
      if (result.success) {
        toast.success("Fixture deleted");
        setRefresh((prev) => !prev);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occured.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div>
          <CardTitle>Fixtures and Results</CardTitle>
          <CardDescription>Manage your fixtures</CardDescription>
        </div>
        <Link href="/dashboard/fixtures-and-results/create">
          <Button>
            <PlusCircle />
            Add New Fixture
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>League</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Leg</TableHead>
              <TableHead>Home</TableHead>
              <TableHead>Home Score</TableHead>
              <TableHead>Away Score</TableHead>
              <TableHead>Away</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixtures.map((fixture) => (
              <Fixture
                key={fixture.id}
                fixture={fixture}
                onDelete={handleDeleteFixture}
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
              onClick={loadPreviousFixtures}
              disabled={isLoading || !hasPrevious}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreFixtures}
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
