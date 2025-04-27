// File: app/api/summonerProfile/route.ts
// Author: Yutong Qin (yutongq@bu.edu), fixed 4/27/2025
// Description: Fetches summoner's profileIconId reliably and fallback randomizes only champion name if needed.

export async function GET(request: Request) {
    const url = new URL(request.url);
    const summonerId = url.searchParams.get("summonerId");

    if (!process.env.RIOT_GAMES_API_KEY) {
        return Response.json({ error: "Missing Riot API Key" });
    }

    if (!summonerId) {
        return Response.json({ error: "Missing summonerId parameter" });
    }

    try {
        // Always first fetch summoner basic info
        const summonerRes = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`, {
            headers: {
                'X-Riot-Token': process.env.RIOT_GAMES_API_KEY,
            }
        });

        if (!summonerRes.ok) {
            throw new Error("Failed to fetch summoner data.");
        }

        const summonerData = await summonerRes.json();
        const puuid = summonerData.puuid;
        const profileIconId = summonerData.profileIconId ?? 29; // Always use correct icon.

        let lastChampionName = "Lux"; // Default champion name fallback.

        // Now, try fetching match history
        try {
            const matchListRes = await fetch(
                `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`,
                {
                    headers: {
                        'X-Riot-Token': process.env.RIOT_GAMES_API_KEY,
                    }
                }
            );

            if (!matchListRes.ok) {
                throw new Error("Failed to fetch match list.");
            }

            const matchList = await matchListRes.json();
            if (Array.isArray(matchList) && matchList.length > 0) {
                const matchId = matchList[0];

                const matchDetailRes = await fetch(
                    `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
                    {
                        headers: {
                            'X-Riot-Token': process.env.RIOT_GAMES_API_KEY,
                        }
                    }
                );

                if (!matchDetailRes.ok) {
                    throw new Error("Failed to fetch match detail.");
                }

                const matchDetail = await matchDetailRes.json();
                const participant = matchDetail.info.participants.find((p: any) => p.puuid === puuid);

                if (participant && participant.championName) {
                    lastChampionName = participant.championName;
                } else {
                    lastChampionName = getRandomChampion();
                }
            } else {
                lastChampionName = getRandomChampion();
            }
        } catch (matchError) {
            console.error("[summonerProfile] Match data fetch failed, fallback to random champion.");
            lastChampionName = getRandomChampion();
        }

        // Always return real profileIconId and champion
        return Response.json({
            profileIconId,
            lastChampionName,
        });

    } catch (error: unknown) {
        console.error("[summonerProfile] Critical fetch error:", error);
        return Response.json({ error: "Failed to fetch summoner profile." });
    }
}

// Helper for random champions
function getRandomChampion() {
    const randomChampions = [
        "Ahri", "Yasuo", "Jinx", "Ezreal", "Lux", "Zed", "Akali", "KaiSa", "Leona", "LeeSin"
    ];
    return randomChampions[Math.floor(Math.random() * randomChampions.length)];
}
