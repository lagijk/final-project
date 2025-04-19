// File: app/api/matchData/route.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: API handler that handles the match ID information in the backend
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

export async function GET(request: Request) {

    // shows error message if riot api is down
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json(
            {error: "Something went wrong with Riot's API key."}
        );
    }

    // shows error message if accessing query paramter of puuid fails
    const url = new URL(request.url);
    const puuid = url.searchParams.get("puuid");

    if (!puuid) {
        return Response.json(
            {error: "Missing PUUID"}
        );
    }

    try {
        // fetch 20 match ids
        const rawData = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
            { 
                headers: {
                    'X-Riot-Token': process.env.RIOT_GAMES_API_KEY 
                }
            });
            const result = await rawData.json();
            return Response.json(result);
    } catch (err: unknown) {
        let message = "Unknown error";
            if (err instanceof Error) {
                message = err.message;
            }
        return Response.json({error: message});
    }
}