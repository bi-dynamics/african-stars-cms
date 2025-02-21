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
import { toast } from "sonner";
import { deleteFeaturedNews } from "@/lib/actions";
import Link from "next/link";
import { FixturesData } from "@/lib/fixtures";
import { DocumentReference, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Fixture({ fixture }: { fixture: FixturesData }) {
  const [homeTeamData, setHomeTeamData] = useState<{
    name: string;
    logo: string;
  } | null>(null);
  const [awayTeamData, setAwayTeamData] = useState<{
    name: string;
    logo: string;
  } | null>(null);

  useEffect(() => {
    const fetchTeamData = async (
      teamId: DocumentReference,
      setTeamData: (data: { name: string; logo: string } | null) => void
    ) => {
      try {
        const teamDoc = await getDoc(teamId);
        if (teamDoc.exists()) {
          setTeamData({
            name: teamDoc.data().name,
            logo: teamDoc.data().image_url,
          });
        } else {
          console.error("No such document!");
          setTeamData(null);
        }
      } catch (error) {
        console.error("Error getting document:", error);
        setTeamData(null);
      }
    };

    if (fixture.home_team_id) {
      fetchTeamData(fixture.home_team_id, setHomeTeamData);
    }

    if (fixture.away_team_id) {
      fetchTeamData(fixture.away_team_id, setAwayTeamData);
    }
  }, [fixture.home_team_id, fixture.away_team_id]); // Only re-run the effect if the fixture IDs change

  const handleDelete = async (teamId: string) => {
    await deleteFeaturedNews(teamId).then(() => {
      location.reload();
    });
    toast.success("Fixture deleted successfully");
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{fixture.match_info.league}</TableCell>
      <TableCell className="font-medium">
        {fixture.match_info.competitionStage}
      </TableCell>
      <TableCell className="font-medium">{fixture.match_info.leg}</TableCell>
      {homeTeamData && (
        <>
          <TableCell className="flex flex-col items-center justify-center font-bold">
            <Image
              src={homeTeamData.logo}
              alt="Home Team Logo"
              className=" aspect-square rounded-md object-contain w-20  "
              height={512}
              width={512}
            />
            {homeTeamData.name}
          </TableCell>
        </>
      )}
      <TableCell className="font-bold">{fixture.scores?.home}</TableCell>

      <TableCell className="font-bold">{fixture.scores?.away}</TableCell>

      <TableCell className="flex flex-col items-center justify-center font-bold">
        {awayTeamData && (
          <>
            <Image
              src={awayTeamData.logo}
              alt="Away Team Logo"
              className=" aspect-square rounded-md object-contain w-20  "
              height={512}
              width={512}
            />
            {awayTeamData.name}
          </>
        )}
      </TableCell>
      <TableCell className="font-medium">14/02/2025</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {fixture.status}
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
            <DropdownMenuItem>Mobile Preview</DropdownMenuItem>
            <Link href={`/dashboard/fixtures/${fixture.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => handleDelete(fixture.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
