export async function GET(request: Request) {
    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json({ error: "Something went wrong with Riot's API key." });
    }

    const url = new URL(request.url);
    const riotId = url.searchParams.get("summonerName");

    if (!riotId || !riotId.includes("#")) {
        return Response.json({ error: "Invalid Riot ID format" });
    }

    const [gameName, tagLine] = riotId.split("#");

    try {
        // Step 1: Get basic account info
        const accountRes = await fetch(
            `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
            {
                headers: { "X-Riot-Token": process.env.RIOT_GAMES_API_KEY }
            }
        );
        const account = await accountRes.json();

        // Step 2: Get summoner info (icon, level, ID)
        const summonerRes = await fetch(
            `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
            {
                headers: { "X-Riot-Token": process.env.RIOT_GAMES_API_KEY }
            }
        );
        const summoner = await summonerRes.json();

        // ✅ Step 3: Get ranked info
        const rankedRes = await fetch(
            `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
            {
                headers: { "X-Riot-Token": process.env.RIOT_GAMES_API_KEY }
            }
        );
        const ranked = await rankedRes.json();

        // Return combined result
        return Response.json({
            gameName,
            tagLine,
            puuid: account.puuid,
            profileIconId: summoner.profileIconId,
            summonerLevel: summoner.summonerLevel,
            ranked // ✅ this will now show up in ProfileCard!
        });

    } catch (err: unknown) {
        let message = "Unknown error";
        if (err instanceof Error) message = err.message;
        return Response.json({ error: message });
    }
}
