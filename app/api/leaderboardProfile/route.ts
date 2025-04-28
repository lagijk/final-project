// File: app/api/leaderboardProfile/route.ts
// Author: Yutong Qin (yutongq@bu.edu) 4/28/2025
// Description: API handler for the details information to constructing the top player profile
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

type Participant = {
  puuid: string;
  championName: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const puuid = url.searchParams.get("puuid");

  // show error if input puuid is invalid or unavailable
  if (!puuid) {
    return new Response(JSON.stringify({ error: "Missing puuid" }), { status: 400 });
  }

  try {
    // fetch account information (gameName, tagLine) using puuid from account-v1 api
    const accountRes = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`, {
      headers: {
        "X-Riot-Token": process.env.RIOT_GAMES_API_KEY!,
      },
    });

    if (!accountRes.ok) {
      throw new Error("Failed to fetch account info");
    }

    const accountData = await accountRes.json();

    // fetch profileIconId using puuid from sommoner-v4 api
    const summonerRes = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
      headers: {
        "X-Riot-Token": process.env.RIOT_GAMES_API_KEY!,
      },
    });

    if (!summonerRes.ok) {
      throw new Error("Failed to fetch summoner info");
    }

    const summonerData = await summonerRes.json();

    // fetch the match list using puuid from match-v5 api
    // needed to get the last match id and last champion to set the banner image of each player
    const matchListRes = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`, {
      headers: {
        "X-Riot-Token": process.env.RIOT_GAMES_API_KEY!,
      },
    });

    if (!matchListRes.ok) {
      throw new Error("Failed to fetch match list");
    }

    const matchList = await matchListRes.json();
    const lastMatchId = matchList[0];

    // a default fallback
    let lastChampionName = "Lux";

    if (lastMatchId) {
      const matchDetailRes = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${lastMatchId}`, {
        headers: {
          "X-Riot-Token": process.env.RIOT_GAMES_API_KEY!,
        },
      });

      if (matchDetailRes.ok) {
        const matchDetail = await matchDetailRes.json();
        const participant = matchDetail.info.participants.find((p: Participant) => p.puuid === puuid);

        if (participant) {
          lastChampionName = participant.championName || "Lux";
        }
      }
    }

    // return all combined information in order to be displayed if the player's rank button is being hovered in LeaderBoard component
    // formatting in ProfileLeaderboard component
    return new Response(JSON.stringify({
      profileIconId: summonerData.profileIconId,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      lastChampionName,
    }), { status: 200 });
  
    // error handler for unexpected errors
  } catch (error) {
    console.error("[leaderboardProfile] Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
