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
import { useRouter } from "next/navigation";
import { FixturesData, getFixtures } from "@/lib/fixtures";

export default function FixturesTable() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixturesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more pages
  const [hasPrevious, setHasPrevious] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFixtures();
    console.log("pageloaded");
  }, []);

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
      console.log("currentpage for fetch" + currentPage);
      setHasPrevious(currentPage > 1);
      setHasMore(fixtures.length === 5);
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
