import { TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FeaturedNews } from "@/lib/FeaturedNews/definitions";

interface ArticleProps {
  article: FeaturedNews;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export default function Article({ article, onDelete }: ArticleProps) {
  const handleDelete = () => {
    onDelete(article.id);
  };

  return (
    <TableRow>
      <TableCell className="w-40">
        <Image
          src={article.picture}
          alt="Article Image"
          className=" aspect-square rounded-md object-cover w-40 h-24"
          height={128}
          width={128}
        />
      </TableCell>
      <TableCell className="font-bold w-40 ">{article.title}</TableCell>
      <TableCell className="font-medium line-clamp-5 overflow-ellipsis pb-0">
        {article.description}
      </TableCell>
      <TableCell className="font-medium">17/09/2024</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {article.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <Link href={`/dashboard/featured-news/${article.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
