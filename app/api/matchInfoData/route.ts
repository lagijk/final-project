// File: app/api/matchInfoData/route.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: API handler that handles the detailed match information using match id from match history
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

export async function GET(request: Request) {

    // shows error message if riot api is down
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json(
            {error: "Something went wrong with Riot's API key."}
        );
    }

    // shows error message if accessing query paramter of match result id fails
    const url = new URL(request.url);
    const matchResult = url.searchParams.get("matchResult");

    if (!matchResult) {
        return Response.json(
            {error: "Missing match id result"}
        );
    }

    try {
        // call riot games' match v5 api to fetch detail information on each match
        const rawData = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchResult}`,
            {
                headers: {
                    'X-Riot-Token': process.env.RIOT_GAMES_API_KEY
                }
            });
        // return the list of detail match result to the frontend
        const result = await rawData.json();
        return Response.json(result);

    // error handling
    } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        return Response.json({error: message});
    }
}
