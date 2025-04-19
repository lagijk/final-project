// File: app/api/summonerData/route.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: API handler that handles the summoner information in the backend
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

export async function GET(request: Request) {

    // shows error message if riot api is down
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json(
            {error: "Something went wrong with Riot's API key."}
        );
    }

    // shows error message if accessing query paramter of summoner riotID fails
    const url = new URL(request.url);
    const riotId = url.searchParams.get("summonerName");

    if (!riotId || !riotId.includes("#")) {
        return Response.json(
            {error: "Invalid Riot ID format"}
        );
    }
    const [gameName, tagLine] = riotId.split("#");

    try {
        const rawData = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
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
