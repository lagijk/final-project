// app/components/ProfileLeaderboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";

type ProfileLBProps = {
    summonerId: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    lbRank: number;
    profileIconId?: number;
    lastChampionName?: string;
};

export default function ProfileLeaderboard({
    summonerId,
    leaguePoints,
    wins,
    losses,
    lbRank,
    profileIconId = 29,
    lastChampionName = "Lux",
}: ProfileLBProps) {
    const avatarUrl = `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${profileIconId}.png`;
    const [bannerUrl, setBannerUrl] = useState<string>(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg`);

    useEffect(() => {
        if (!lastChampionName) return;

        const testBanner = new Image();
        const tryUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${lastChampionName}_0.jpg`;

        testBanner.src = tryUrl;
        testBanner.onload = () => {
            setBannerUrl(tryUrl); // Valid banner
        };
        testBanner.onerror = () => {
            setBannerUrl(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg`); // fallback to Lux
        };
    }, [lastChampionName]);

    const calcWinRate = (wins: number, losses: number) =>
        wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);

    return (
        <Box
            sx={{
                backgroundImage: `url(${bannerUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center 25%",
                backgroundRepeat: "no-repeat",
                borderRadius: 3,
                p: 3,
                color: "#fff",
                minHeight: 230,
                maxHeight: 250,
                position: "relative",
                boxShadow: 4,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={avatarUrl} sx={{ width: 64, height: 64, border: `2px solid #fff` }} />
                <Box>
                    <Typography variant="h6" fontWeight="bold">Player #{lbRank}</Typography>
                    <Typography variant="body2" fontWeight="bold">{summonerId.slice(0, 8)}...</Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={4} mt={2}>
                <Box>
                    <Typography variant="body1" fontWeight="bold">Leaderboard</Typography>
                    <Typography fontWeight="bold">Rank #{lbRank}</Typography>
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight="bold">LP</Typography>
                    <Typography fontWeight="bold">{leaguePoints} LP</Typography>
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight="bold">Wins</Typography>
                    <Typography fontWeight="bold">{wins} W</Typography>
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight="bold">Losses</Typography>
                    <Typography fontWeight="bold">{losses} L</Typography>
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight="bold">Win Rate</Typography>
                    <Typography fontWeight="bold">{calcWinRate(wins, losses)}%</Typography>
                </Box>
            </Stack>
        </Box>
    );
}
