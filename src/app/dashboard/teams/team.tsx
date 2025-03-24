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
import { Teams } from "@/lib/Teams/definitions";

interface TeamProps {
  team: Teams;
  onDelete: (id: string) => void;
}
export default function Team({ team, onDelete }: TeamProps) {
  const handleDelete = () => {
    onDelete(team.id);
  };

  return (
    <TableRow>
      <TableCell>
        <Image
          src={team.image_url}
          alt="Team Logo"
          className=" aspect-square rounded-md object-contain w-40 "
          height={512}
          width={512}
        />
      </TableCell>
      <TableCell className="font-bold">{team.name}</TableCell>

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
            <DropdownMenuItem>Mobile Preview</DropdownMenuItem>
            <Link href={`/dashboard/teams/${team.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
