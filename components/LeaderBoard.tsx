// File: app/components/LeaderBoard.tsx
// Author: Yutong Qin (yutongq@bu.edu), 4/26/2025
// Description: Displays top players categorized by queues.

"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Card, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LeagueItemDTO } from "@/type";
import ProfileLeaderboard from "@/components/ProfileLeaderboard";

type LeaderBoardProps = {
    leaderboardId: string[];
};

// Extend LeagueItemDTO to include fetched extra fields
type ExtendedPlayer = LeagueItemDTO & {
    profileIconId?: number;
    lastChampionName?: string;
};

export default function LeaderBoard({ leaderboardId }: LeaderBoardProps) {
    const [playerQueue, setPlayerQueue] = useState<ExtendedPlayer[][]>([[], []]);

    useEffect(() => {
        if (!leaderboardId || leaderboardId.length !== 2) return;

        async function fetchLeaderBoardData() {
            try {
                const leaderBoardData = leaderboardId.map(id =>
                    fetch(`/api/leaderBoard?id=${id}`).then(res => res.json())
                );

                const leaderBoardResults = await Promise.all(leaderBoardData);
                const playerData = leaderBoardResults.map(result => (result.entries ?? []).slice(0, 30)); // Top 30 only

                // Fetch extra profile info
                const enrichedPlayerData = await Promise.all(
                    playerData.map(async (queue) => {
                        const updatedQueue = await Promise.all(
                            queue.map(async (player: LeagueItemDTO) => {
                                try {
                                    const res = await fetch(`/api/summonerProfile?summonerId=${player.summonerId}`);
                                    const data = await res.json();
                                    if (data.error) throw new Error(data.error);
                                    return {
                                        ...player,
                                        profileIconId: data.profileIconId,
                                        lastChampionName: data.lastChampionName,
                                    };
                                } catch (error) {
                                    console.error("Failed to enrich player:", player.summonerId, error);
                                    return { ...player }; // fallback to raw player
                                }
                            })
                        );
                        return updatedQueue;
                    })
                );

                setPlayerQueue(enrichedPlayerData);
            } catch (err) {
                console.error("Error occurred while fetching leaderboard:", err);
            }
        }

        fetchLeaderBoardData();
    }, [leaderboardId]);

    return (
        <Box sx={{ p: 4 }}>
            {["RANKED_SOLO_5x5", "RANKED_FLEX_SR"].map((queue, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Card sx={{ width: "100%", backgroundColor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, minHeight: 72 }}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 1 }}>
                                <Typography fontWeight="bold">{queue}</Typography>
                            </Stack>
                        </Card>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 4, py: 2 }}>
                        <Stack spacing={2} justifyContent="center" sx={{ maxWidth: "xl", mx: "auto" }}>
                            {playerQueue[index]?.length > 0 ? (
                                playerQueue[index].map((player, idx) => (
                                    <Box key={idx}>
                                        <ProfileLeaderboard
                                            summonerId={player.summonerId}
                                            leaguePoints={player.leaguePoints}
                                            wins={player.wins}
                                            losses={player.losses}
                                            lbRank={idx + 1}
                                            profileIconId={player.profileIconId}
                                            lastChampionName={player.lastChampionName}
                                        />
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">No data available</Typography>
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
