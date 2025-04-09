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
import Article from "./article";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getFeaturedNews } from "@/lib/FeaturedNews/data";
import { deleteFeaturedNews } from "@/lib/FeaturedNews/actions";
import { FeaturedNews } from "@/lib/FeaturedNews/definitions";

export default function NewsTable() {
  const [featuredNews, setFeaturedNews] = useState<FeaturedNews[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if there are more pages
  const [hasPrevious, setHasPrevious] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, [refresh]);

  const fetchArticles = async (
    nextPage: boolean = false,
    prevPage: boolean = false,
    currentPage: number = 1
  ) => {
    if (isLoading) return;

    setIsLoading(true);

    let articles;
    if (nextPage) {
      articles = await getFeaturedNews(nextPage, false);
    } else if (prevPage) {
      articles = await getFeaturedNews(false, prevPage);
    } else {
      articles = await getFeaturedNews();
    }
    if (articles !== undefined) {
      setFeaturedNews(articles); // replace existing articles with new ones

      // Check for hasPrevious and hasMore based on the number of articles fetched
      console.log("currentpage for fetch" + currentPage);
      setHasPrevious(currentPage > 1);
      setHasMore(articles.length === 5);
    } else {
      console.error("Featured news returned undefined");
    }

    setIsLoading(false);
  };

  const loadMoreArticles = async () => {
    const newCurrentPage = currentPage + 1;
    setCurrentPage(newCurrentPage);
    fetchArticles(true, false, newCurrentPage);
  };

  const loadPreviousArticles = async () => {
    const newCurrentPage = currentPage - 1;
    setCurrentPage(newCurrentPage);
    fetchArticles(false, true, newCurrentPage);
  };

  const handleDeleteFeaturedNews = async (id: string) => {
    toast.info("Deleting article");
    try {
      const result = await deleteFeaturedNews(id);
      if (result.success) {
        toast.success("Article deleted");
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
          <CardTitle>Featured News</CardTitle>
          <CardDescription>Manage your news articles</CardDescription>
        </div>
        <Link href="/dashboard/featured-news/create">
          <Button>
            <PlusCircle />
            Add New Article
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featuredNews.map((article) => (
              <Article
                key={article.id}
                article={article}
                onDelete={handleDeleteFeaturedNews}
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
              onClick={loadPreviousArticles}
              disabled={isLoading || !hasPrevious}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreArticles}
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
