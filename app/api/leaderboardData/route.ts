// File: app/api/leaderboardData/route.ts
// Author: Yutong Qin (yutongq@bu.edu) 4/27/2025, (updated) 4/28/2025
// Description: API handler for the base information (rank/win/loss/lp) of top players on the list
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import { LeagueItemDTO } from "@/type"

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // show error if the input id is invalid
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  // show error if the API key is invalid
  if (!process.env.RIOT_GAMES_API_KEY) {
    return Response.json({ error: "Missing Riot API Key" }, { status: 500 });
  }

  // fetch the base info (win/loss/rank/lp) of top 30 players using id through league-v4 api
  try {
    const res = await fetch(`https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${id}`, {
      headers: {
        "X-Riot-Token": process.env.RIOT_GAMES_API_KEY!,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch leaderboard data");
    }

    const leaderboardData = await res.json();
    const entries = leaderboardData.entries ?? [];

    // store those necessary base info into the list to avoid exceeding api limit
    const trimmedEntries = entries.slice(0, 30).map((player: LeagueItemDTO) => ({
      summonerId: player.summonerId,
      puuid: player.puuid,
      leaguePoints: player.leaguePoints,
      wins: player.wins,
      losses: player.losses,
      rank: player.rank,
    }));

    return Response.json({ entries: trimmedEntries });

  // error handling
  } catch (err) {
    console.error("[leaderboardData] Fatal error:", err);
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
