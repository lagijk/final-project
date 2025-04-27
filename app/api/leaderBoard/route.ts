// File: app/api/leaderBoard/route.ts
// Author: Yutong Qin (yutongq@bu.edu) 4/26/2025
// Description: API handler that handles the information of top challenge players to build the leadershipboard
// code source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import { LeagueListDTO } from "@/type";

export async function GET(request: Request) {
    // assign a search parameter 'id' from the request URL 
    // for dynamically fetch data from the API based on different queues
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    // shows the error message if the 'id' parameter is invalid or missing
    if (!id || !["RANKED_SOLO_5x5", "RANKED_FLEX_SR"].includes(id)) {
        return Response.json({ error: "Invalid or missing queue id." });
    }

    // shows the error message if Riot API is down
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json(
            { error: "Something went wrong with Riot's API key."}
        );
    }

    try {
        // fetch top players for the specified queue from Riot's League-v4 API
        const response = await fetch(`https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${id}`, 
            {
                headers: { 'X-Riot-Token': process.env.RIOT_GAMES_API_KEY }
            }
        );

        // if the fetching failed
        if (!response.ok) {
            const errorDetails = await response.text(); 
            console.error(`Failed to fetch data for ${id}. Response:`, errorDetails);
            throw new Error(`Failed to fetch data for ${id}`);
        }

        const ldData: LeagueListDTO = await response.json();
        console.log('Riot API Response:', ldData);

        // check whether there are entries for the current queue and assign them to leaderboardData
        const entries = (ldData.entries ?? []).slice(0, 30);
    
        // return the leaderboard data for the specific queue
        return Response.json({ entries });

    // error handling    
    } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) {
            message = err.message;
        }
        return Response.json({ error: message });
    }
}