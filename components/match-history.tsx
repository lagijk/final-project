// File: app/components/match-history.tsx
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: The frontend page that allows users to search their match history based on username and tag.

"use client";
import {useEffect, useState} from "react";
import { Match } from "@/type";

export default function MatchHistory() {
    const [match, setMatch] = useState<Match[]>([]);
    const [summonerName, setSummonerName] = useState("");
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!summonerName) return;

        async function fetchMatchHistory() {
            try {
                console.log("Fetching match history for:", summonerName);
                // retrieve summoner puuid data from riot api through route handler in backend
                // we need to use encodeURIComponent becasue user will enter # for tag, and we need to convert that to % for backend
                const summonerData = await fetch(`/api/summonerData?summonerName=${encodeURIComponent(summonerName)}`);
                const summonerResult = await summonerData.json();
               
                // retrieve the match ID data through route handler in backend
                const matchData = await fetch (`/api/matchData?puuid=${summonerResult.puuid}`);
                const matchResults = await matchData.json();

                // retrieve the match information for the first 20 games based on user's match ID data
                const matchInfo = await Promise.all(matchResults.slice(0, 20).map((matchResult: string) => 
                    fetch(`/api/matchInfoData?matchResult=${matchResult}`).then(result => result.json()))
                );

                // map the match information with the player's puuid
                const result = matchInfo.map((match: any) => {
                    const player = match.info.participants.find(
                        (p: any) => p.puuid === summonerResult.puuid 
                    );
                    return {
                        game: match.info.gameMode, 
                        champion: player.championName,
                        kills: player.kills, 
                        deaths: player.deaths,
                        assists: player.assists,
                        win: player.win,
                    };
                });
                setMatch(result); 

            } catch (err) {
                console.error("Error occurred", err);
            }
        }

        fetchMatchHistory();
    }, [summonerName]);

    return (
        <div>
            <h1>Recent Match History</h1>
            <input
                type="text"
                placeholder="Game name #Game tag"
                value={input}
                required
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={() => {
                const cleaned = input.replace(/\s+/g, "").trim();
                setSummonerName(cleaned);
            }}>
                Search
            </button>

            {match.length > 0 && (
                <div>
                    {match.map((m, i) => (
                    <div key={i}>
                        <p>{m.champion} | {m.game}</p>
                        <p>{m.kills}/{m.deaths}/{m.assists} - {m.win ? "Victory": "Defeat"}</p>
                    </div>
                ))}
                </div>
            )}

        </div>
    );
}


