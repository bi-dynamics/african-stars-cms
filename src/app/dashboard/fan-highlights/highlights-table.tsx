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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FanHighlightsData, getFanHighlights } from "@/lib/fanHighlights";
import Highlight from "./highlight";

export default function HighlightsTable() {
  const router = useRouter();
  const [fanHighlights, setFanHighlights] = useState<FanHighlightsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more pages
  const [hasPrevious, setHasPrevious] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
    console.log("pageloaded");
  }, []);

  const fetchData = async (
    nextPage: boolean = false,
    prevPage: boolean = false,
    currentPage: number = 1
  ) => {
    if (isLoading) return;

    setIsLoading(true);

    let data;
    if (nextPage) {
      data = await getFanHighlights(nextPage, false);
    } else if (prevPage) {
      data = await getFanHighlights(false, prevPage);
    } else {
      data = await getFanHighlights();
    }
    if (data !== undefined) {
      setFanHighlights(data); // replace existing articles with new ones

      // Check for hasPrevious and hasMore based on the number of articles fetched
      console.log("currentpage for fetch" + currentPage);
      setHasPrevious(currentPage > 1);
      setHasMore(data.length === 5);
    } else {
      console.error("Featured news returned undefined");
    }

    setIsLoading(false);
  };

  const loadMoreHighlights = async () => {
    const newCurrentPage = currentPage + 1;
    setCurrentPage(newCurrentPage);
    fetchData(true, false, newCurrentPage);
  };

  const loadPreviousHighlights = async () => {
    const newCurrentPage = currentPage - 1;
    setCurrentPage(newCurrentPage);
    fetchData(false, true, newCurrentPage);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row w-full justify-between items-center">
        <div>
          <CardTitle>Fan Highlights</CardTitle>
          <CardDescription>Manage your YouTube fan highlights</CardDescription>
        </div>
        <Link href="/dashboard/fan-highlights/create">
          <Button>
            <PlusCircle />
            Add New Video
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Video Link</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fanHighlights.length === 0 && (
              <TableRow className="border w-full">
                <TableCell colSpan={5}>
                  No more fan highlights available. Get started by clicking{" "}
                  <strong>'Add New Video'</strong>
                </TableCell>
              </TableRow>
            )}
            {fanHighlights.map((highlight) => (
              <Highlight
                key={highlight.id}
                highlight={highlight}
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
              onClick={loadPreviousHighlights}
              disabled={isLoading || !hasPrevious}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreHighlights}
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
