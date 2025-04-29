// File: app/api/summonerData/route.ts
// Author: Alex Chen (achen119@bu.edu) 4/18/2025, Jihye Lee (jh020211@bu.edu) 4/24/2025 (updated)
// Description: API handler that handles the summoner information, and provides puuid for match history and player profile
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import {MatchDetail} from "@/type"
export async function GET(request: Request) {

    // shows error message if riot api is down
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json(
            { error: "Something went wrong with Riot's API key." }
        );
    }

    // shows error message if accessing query paramter of summoner riotID fails
    const url = new URL(request.url);
    const riotId = url.searchParams.get("summonerName");

    if (!riotId || !riotId.includes("#")) {
        return Response.json(
            { error: "Invalid Riot ID format" }
        );
    }
    // split the riot id into gameName and tagLine (e.g. LaggyDic#25069 into Laggy Dic, 25069)
    const [gameName, tagLine] = riotId.split("#");

    try {
        // fetch account info from Riot's account-v1 API (gives puuid, gameName, tagLine)
        const accountRes = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
            headers: {
                'X-Riot-Token': process.env.RIOT_GAMES_API_KEY
            }
        });
        const accountData = await accountRes.json();

        //========== above done by Alex ================//
        //========== below done by Jihye ===============//

        // fetch summoner info from summoner-v4 API (gives profileIconId, summonerId, etc.)
        const summonerRes = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`, {
            headers: {
                'X-Riot-Token': process.env.RIOT_GAMES_API_KEY
            }
        });
        const summonerData = await summonerRes.json();

        // fetch ranked data from league-v4 API (returns array of ranked queues info)
        const rankedRes = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`, {
            headers: {
                'X-Riot-Token': process.env.RIOT_GAMES_API_KEY
            }
        });
        const rankedData = await rankedRes.json();

        // Fetch the list of recent match IDs for the summoner using their PUUID
        const matchListRes = await fetch(
            `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${accountData.puuid}/ids?start=0&count=1`,
            {
                headers: { 'X-Riot-Token': process.env.RIOT_GAMES_API_KEY }
            }
        );

        // Extract the most recent match ID from the response
        const [firstMatchId] = await matchListRes.json();

        // Fetch detailed match data using the first match ID
        const matchDetailRes = await fetch(
            `https://americas.api.riotgames.com/lol/match/v5/matches/${firstMatchId}`,
            {
                headers: { 'X-Riot-Token': process.env.RIOT_GAMES_API_KEY }
            }
        );

        // Parse the detailed match JSON response
        const matchDetail: MatchDetail = await matchDetailRes.json();

        // Find the summoner's participant object using their PUUID
        const participant = matchDetail?.info?.participants
            ? matchDetail.info.participants.find((p) => p.puuid === accountData.puuid)
            : undefined;

        // Extract the last played champion's name, default to "Lux" if not found
        const lastChampionName = participant?.championName || "Lux";

        // send combined profile info including puuid for match history,
        // gameName/tagLine for display, and ranked data for ProfileCard
        return Response.json({
            puuid: accountData.puuid,
            gameName: accountData.gameName,
            tagLine: accountData.tagLine,
            profileIconId: summonerData.profileIconId,
            ranked: rankedData,
            lastChampionName
        });

    // error handling
    } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        return Response.json({ error: message });
    }
}
