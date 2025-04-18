"use client";

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
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Fixtures } from "@/lib/Fixtures/definitions";
import { db } from "@/app/firebase/config";

interface FixtureProps {
  fixture: Fixtures;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
}

interface Team {
  name: string;
  logo: string;
}

export default function Fixture({ fixture, onDelete }: FixtureProps) {
  const [homeTeamData, setHomeTeamData] = useState<Team | null>(null);
  const [awayTeamData, setAwayTeamData] = useState<Team | null>(null);

  let displayDate: string = "Invalid Date";

  if (fixture.match_date) {
    if (fixture.match_date instanceof Timestamp) {
      // Convert Timestamp to Date
      const date = fixture.match_date.toDate();
      displayDate = date.toLocaleString();
    } else {
      // Handle cases where match_date is not a Timestamp
      displayDate = "Invalid Format";
    }
  } else {
    // Handle cases where match_date is undefined or null
    displayDate = "Date TBA";
  }

  type TeamSetter = Dispatch<SetStateAction<Team | null>>;

  useEffect(() => {
    //get individual team documents for the fixture
    const fetchTeamData = async (teamId: string, setTeamData: TeamSetter) => {
      try {
        const teamDocRef = doc(db, `teams/${teamId}`);
        const teamDoc = await getDoc(teamDocRef);
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

  const handleDelete = () => {
    onDelete(fixture.id);
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
      <TableCell className="font-medium">
        <Badge variant="outline" className="capitalize">
          {displayDate}
        </Badge>
      </TableCell>
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
            <Link href={`/dashboard/fixtures-and-results/${fixture.id}`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
