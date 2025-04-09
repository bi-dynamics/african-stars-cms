import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { FanHighlights } from "@/lib/FanHighlights/definitions";

interface HighlightProps {
  highlight: FanHighlights;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}
export default function Highlight({ highlight, onDelete }: HighlightProps) {
  const [videoTitle, setVideoTitle] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await fetch(
          `https://noembed.com/embed?dataType=json&url=${highlight.src}`
        );
        const data = await response.json();

        if (data.title) setVideoTitle(data.title);

        if (data.thumbnail_url) setVideoThumbnail(data.thumbnail_url);
      } catch (error) {
        console.error("Error fetching video details:", error);
      }
    };

    fetchVideoDetails();
  }, [highlight.src]);

  const handleDelete = () => {
    const id = highlight.id;
    onDelete(id);
  };
  return (
    <TableRow>
      <TableCell className="w-40">
        <Image
          src={videoThumbnail}
          alt="Article Image"
          className=" aspect-square rounded-md object-cover w-40 h-24"
          height={128}
          width={128}
        />
      </TableCell>
      <TableCell className="font-bold ">{videoTitle}</TableCell>
      <TableCell className="font-medium ">{highlight.src}</TableCell>
      <TableCell className="font-medium  ">17/07/2024</TableCell>
      <TableCell className="font-medium ">
        <Badge variant="outline" className="capitalize">
          {highlight.status}
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

            <Link href={`/dashboard/fan-highlights/${highlight.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
