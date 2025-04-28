// File: app/components/LeaderBoard.tsx
// Author: Yutong Qin (yutongq@bu.edu) 4/26/2025, (updated) 4/28/2025
// Description: Holds for the leaderboard page to display top players of two queues, and shows details only during hover

"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Card, Stack, Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import { LeagueItemDTO } from "@/type";
import ProfileLeaderboard from "@/components/ProfileLeaderboard";

// get the props of players' detailed profiles
type LeaderBoardProps = {
    leaderboardId: string[];
};

// extend the return list LeagueItemDTO to include newly required types
type ExtendedPlayer = LeagueItemDTO & {
    profileIconId?: number;
    lastChampionName?: string;
    gameName?: string;
    tagLine?: string;
    puuid: string;
};

export default function LeaderBoard({ leaderboardId }: LeaderBoardProps) {
    // hold the list of two queues of top players to display
    const [playerQueue, setPlayerQueue] = useState<ExtendedPlayer[][]>([[], []]);
    // hold the hover using array to separately consider both queues
    const [hoveredPlayer, setHoveredPlayer] = useState<([{ player: ExtendedPlayer; lbRank: number} | null, { player: ExtendedPlayer; lbRank: number} | null])>([null,null]);
    // hold the complete fetched profiles for players
    const [fetchedProfiles, setFetchedProfiles] = useState<Record<string, ExtendedPlayer>>({});
    // hold for the situation that aim for better UI while loading the fetching data, separately hold for each queue
    const [loading, setLoading] = useState<[boolean, boolean]>([false, false]);

    useEffect(() => {
        if (!leaderboardId || leaderboardId.length !== 2) return;

        async function fetchLeaderBoardData() {
            // fetch the top 30 players of each queue from the api route /api/leaderboardData/route.ts
            // using id to retrieve the only base info (wins/losses/leaguepoints/...) to avoid API limit
            try {
                const leaderBoardData = leaderboardId.map(id =>
                    fetch(`/api/leaderboardData?id=${id}`).then(res => res.json())
                );

                const leaderBoardResults = await Promise.all(leaderBoardData);
                const playerData = leaderBoardResults.map(result => (result.entries ?? []).slice(0, 30));
                setPlayerQueue(playerData);

            } catch (err) {
                console.error("Error occurred while fetching leaderboard:", err);
            }
        }

        fetchLeaderBoardData();
    }, [leaderboardId]);

    // handles when the user hovers over a player's rank button
    const handleHover = async (player: ExtendedPlayer, idx: number, queueIndex: number) => {
        // if we already fetched this player's profile, use it immediately and pass the lbRank
        if (fetchedProfiles[player.puuid]) {
            setHoveredPlayer(prev => {
                const updated: [{ player: ExtendedPlayer; lbRank: number} | null, { player: ExtendedPlayer; lbRank: number} | null] = [...prev];
                updated[queueIndex] = { player: fetchedProfiles[player.puuid], lbRank: idx+1 };
                return updated;
            });
            return
        }
      
        // otherwise, fetch the details of this specific player through api/leaderboardProfile using their unique puuid
        try {
            // when we don't have exist cached data, loading starts
            setLoading(prev => {
                const updated: [boolean, boolean] = [...prev];
                updated[queueIndex] = true;
                return updated;
            })

            const res = await fetch(`/api/leaderboardProfile?puuid=${player.puuid}`);
            if (!res.ok) throw new Error("Failed to fetch player profile");
            const profile = await res.json();
            const enrichedPlayer = { ...player, ...profile };

            // saved the full information of the player into fetchedProfile
            // set the hoveredPlayer with its enriched profile, and correctly assign the lbRank by idx
            setFetchedProfiles(prev => ({ ...prev, [player.puuid]: enrichedPlayer }));
            setHoveredPlayer(prev => {
                const updated: [{ player: ExtendedPlayer; lbRank: number} | null, { player: ExtendedPlayer; lbRank: number} | null] = [...prev];
                updated[queueIndex] = { player: enrichedPlayer, lbRank: idx+1 };
                return updated;
            });
        
        // error handling that if failed to fetch player profile, use the base leaderboard data instead
        } catch (err) {
            console.error("Failed to fetch player profile:", err);
            setHoveredPlayer(prev => {
                const updated: [{ player: ExtendedPlayer; lbRank: number} | null, { player: ExtendedPlayer; lbRank: number} | null] = [...prev];
                updated[queueIndex] = { player, lbRank: idx+1 };
                return updated;
            });
        } finally {
            // the loading ends
            setLoading(prev => {
                const updated: [boolean, boolean] = [...prev];
                updated[queueIndex] = false;
                return updated;
            });
        }
    };
    
    // display the rendered result using Material UI
    return (
        <Box sx={{ p: 4 }}>
            {["Ranked Solo", "Ranked Flex"].map((queue, index) => (
                <Accordion key={index}>
                    {/* holds for the accordion of two queues, expands by clicking */}
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Card sx={{ width: "100%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, minHeight: 72 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 1 }}>
                                <Typography fontWeight="bold">{queue}</Typography>
                            </Stack>
                        </Card>
                    </AccordionSummary>
                    {/* holds for the design inside each accordion */}
                    <AccordionDetails>
                        <Box display="flex" gap={2}>
                            {/* Left portion: a sidebar that shows the rank only */}
                            <Box flex="1" minWidth="100px">
                            <Stack spacing={1}>
                            {playerQueue[index]?.map((player, idx) => {
                                const isHovered = hoveredPlayer[index]?.player.puuid === player.puuid;

                                // add medals for top 3
                                const rankDisplay = idx === 0
                                ? "🥇#1"
                                : idx === 1
                                ? "🥈#2"
                                : idx === 2
                                ? "🥉#3"
                                : `#${idx + 1}`;

                                // a special colors for top 3
                                const bgColor =
                                idx === 0 ? "gold" :
                                idx === 1 ? "silver" :
                                idx === 2 ? "#cd7f32" :
                                "transparent";

                                // the special hovered colors for top 3
                                const hoverBgColor =
                                idx === 0 ? "goldenrod" :
                                idx === 1 ? "gray" :
                                idx === 2 ? "#a0522d" :
                                "primary.main";

                                return (
                                <Button
                                    key={idx}
                                    variant={isHovered ? "contained" : "outlined"}
                                    fullWidth
                                    onMouseEnter={() => handleHover(player, idx, index)}
                                    sx={{
                                    fontWeight: "bold",
                                    backgroundColor: isHovered ? hoverBgColor : bgColor,
                                    color: isHovered ? "#fff" : (idx <= 2 ? "#000" : "inherit"),
                                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                                    boxShadow: isHovered
                                        ? idx <= 2
                                        ? "0 0 15px 5px rgba(255, 215, 0, 0.6)" 
                                        : "0 0 10px rgba(0, 0, 0, 0.3)"
                                        : "none",
                                    transition: "all 0.25s ease",
                                    borderRadius: 2,
                                    }}
                                >
                                    {rankDisplay}
                                </Button>
                                );
                            })}
                            </Stack>
                            </Box>

                            {/* Right portion: the detailed profile for this specific player */}
                            <Box flex="3" minWidth="0">
                            {loading[index] ? (
                                <Box sx={{
                                    height: 250,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                >
                                    <CircularProgress color="primary" />
                                </Box>
                            ) : hoveredPlayer[index] ? (
                                <ProfileLeaderboard
                                    summonerId={hoveredPlayer[index]!.player.summonerId}
                                    puuid={hoveredPlayer[index]!.player.puuid}
                                    leaguePoints={hoveredPlayer[index]!.player.leaguePoints}
                                    wins={hoveredPlayer[index]!.player.wins}
                                    losses={hoveredPlayer[index]!.player.losses}
                                    lbRank={hoveredPlayer[index]!.lbRank}
                                    profileIconId={hoveredPlayer[index]!.player.profileIconId}
                                    lastChampionName={hoveredPlayer[index]!.player.lastChampionName}
                                    gameName={hoveredPlayer[index]!.player.gameName}
                                    tagLine={hoveredPlayer[index]!.player.tagLine}
                                />
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                Hover a player to see details
                                </Typography>
                            )}
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
