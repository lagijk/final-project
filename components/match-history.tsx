// File: app/components/match-history.tsx
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: The frontend page that allows users to search their match history based on username and tag.

"use client";
import {useEffect, useState} from "react";
import { Match, Player, MatchType, PlayerType } from "@/type";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from "@mui/material/Grid";
import {Box, Typography, Card, Stack, Chip, Accordion, AccordionSummary, AccordionDetails, Avatar, Tooltip} from "@mui/material";

// get the riot games user name and tag from home page as prop
type MatchHistoryProps = {
    summonerName: string; 
};

export default function MatchHistory({summonerName}: MatchHistoryProps) {
    const [match, setMatch] = useState<Match[]>([]);

    useEffect(() => {
        if (!summonerName) return;

        async function fetchMatchHistory() {
            try {
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

                // map the match information with the types
                const matchDetail: Match[] = matchInfo.map((match: MatchType) => {
                    const participants: Player[] = match.info.participants.map((p: PlayerType) => ({
                        championName: p.championName,
                        champLevel: p.champLevel,
                        summonerLevel: p.summonerLevel,
                        kills: p.kills,
                        deaths: p.deaths,
                        assists: p.assists,
                        totalDamageDealt: p.totalDamageDealt,
                        totalDamageTaken: p.totalDamageTaken,
                        totalMinionsKilled: p.totalMinionsKilled,
                        neutralMinionsKilled: p.neutralMinionsKilled,
                        goldEarned: p.goldEarned,
                        wardsPlaced: p.wardsPlaced,
                        wardsKilled: p.wardsKilled,
                        item: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
                    }) );

                    // get the participant that matches the searched puuid
                    const user = match.info.participants.find((p) => p.puuid === summonerResult.puuid);
                    // get the participant's team id and check if they won
                    const winStatus = match.info.teams.find((team) =>
                        team.teamId === user?.teamId
                    )?.win ?? false;
                    // return the info to be used in rendering
                    return {
                        gameMode: match.info.gameMode,
                        player: user ? {
                            championName: user.championName,
                            champLevel: user.champLevel,
                            summonerLevel: user.summonerLevel,
                            kills: user.kills,
                            deaths: user.deaths,
                            assists: user.assists,
                            totalDamageDealt: user.totalDamageDealt,
                            totalDamageTaken: user.totalDamageTaken,
                            totalMinionsKilled: user.totalMinionsKilled,
                            neutralMinionsKilled: user.neutralMinionsKilled,
                            goldEarned: user.goldEarned,
                            wardsPlaced: user.wardsPlaced,
                            wardsKilled: user.wardsKilled,
                            item: [user.item0, user.item1, user.item2, user.item3, user.item4, user.item5, user.item6],
                        } : undefined,

                        win: winStatus,
                        participants,
                        gameName: summonerResult.gameName,
                    };
                });
                setMatch(matchDetail);

            } catch (err) {
                console.error("Error occurred", err);
            }
        }

        fetchMatchHistory();
    }, [summonerName]);

    return (
        <Box sx={{p:4}}>
           
            {match.map((m, i) => (
                <Accordion key={i}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Card
                            sx={{width: "100%", backgroundColor: m.win ? "#e3f2fd" : "#ffebee", display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, minHeight: 72,}}>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ml: 1}}>
                                <Avatar src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${m.player?.championName}.png`} alt={m.player?.championName}
                                        sx={{width: 48, height: 48}}
                                />
                                <Box>
                                    <Typography fontWeight="bold">{m.player?.championName}</Typography>
                                    <Typography variant="body2" color="text.secondary">{m.gameName}</Typography>
                                </Box>
                            </Stack>

                            <Chip
                                label={m.win ? "Victory" : "Defeat"}
                                color={m.win ? "success" : "error"}
                                sx={{fontSize: "1rem", height: 28}}
                            />
                        </Card>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 4, py: 2 }}>
                        <Grid container columns={12} columnSpacing={2} justifyContent="center" sx={{maxWidth: "xl", mx: "auto"}}>
                            {["Team 1", "Team 2"].map((label, teamIndex) => (
                                <Grid key={label} sx={{gridColumn: {xs: "span 12", md: "span 6"}}}>
                                    <Typography variant="subtitle1" sx={{mb: 1}}> {label} </Typography>

                                    <Stack spacing={1}>
                                        {m.participants.slice(teamIndex * 5, teamIndex * 5 + 5).map((p, index) => (
                                            <Box key={index}
                                                 sx={{
                                                     display: "flex",
                                                     alignItems: "center",
                                                     justifyContent: "space-between",
                                                     backgroundColor: "#f5f5f5",
                                                     p: 2,
                                                     gap: 2,
                                                     borderRadius: 2,
                                                     flexWrap: "wrap",
                                                 }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/champion/${p.championName}.png`} alt={p.championName}
                                                        sx={{ width: 40, height: 40 }}
                                                    />
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Lvl {p.champLevel} - Player Lvl {p.summonerLevel}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Typography>KDA: {p.kills}/{p.deaths}/{p.assists}</Typography>
                                                    <Typography>CS: {(p.totalMinionsKilled ?? 0) + (p.neutralMinionsKilled ?? 0)}</Typography>
                                                    <Typography>DMG: {p.totalDamageDealt}</Typography>
                                                    <Typography>Gold: {p.goldEarned}</Typography>
                                                    <Typography>Wards: {p.wardsPlaced} / {p.wardsKilled}</Typography>
                                                </Stack>

                                                <Stack direction="row" spacing={0.5} sx={{flexWrap: "wrap"}}>
                                                    {p.item.map((itemId, itemIdx) =>
                                                        itemId > 0 ? (
                                                            <Tooltip title={`Item ${itemId}`} key={itemIdx}>
                                                                <img src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/item/${itemId}.png`} alt={`item ${itemId}`}
                                                                     width={24}
                                                                     height={24}
                                                                     style={{ borderRadius: 4 }}
                                                                />
                                                            </Tooltip>
                                                        ) : (
                                                            <Box key={itemIdx} width={24} height={24} />
                                                        )
                                                    )}
                                                </Stack>
                                            </Box>
                                        ))}

                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>

                    </AccordionDetails>

                </Accordion>
            ))}

        </Box>
    );
}


