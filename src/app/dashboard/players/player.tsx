import { TableRow, TableCell } from "@/components/ui/table";
import { Players } from "@/lib/Players/definitions";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PlayerProps {
  player: Players;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

export default function Player({ player, onDelete }: PlayerProps) {
  const handleDelete = () => {
    onDelete(player.id);
  };

  return (
    <TableRow>
      <TableCell>
        <Image
          src={player.picture}
          alt="Player Cover Image"
          className=" aspect-square rounded-md object-contain w-40 "
          height={512}
          width={512}
        />
      </TableCell>
      <TableCell className="font-bold">
        {player.firstName.toUpperCase()}
      </TableCell>
      <TableCell className="font-bold">
        {player.lastName.toUpperCase()}
      </TableCell>
      <TableCell className="font-bold">
        {player.position.toUpperCase()}
      </TableCell>
      <TableCell className="font-bold">{player.number}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {player.status}
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
            <Link href={`/dashboard/players/${player.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
