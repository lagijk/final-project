// File: app/components/ProfileCard.tsx
// Author: Jihye Lee (jh020211@bu.edu), 4/24/2025
// Description: The frontend page that shows players profile information

"use client";
import { useEffect, useState } from "react";
import { Box, Avatar, Typography, Stack } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";

// Type for individual ranked queue information
type RankedInfo = {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
};

// Type for the overall profile data returned from API
type ProfileData = {
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId?: number;
    ranked?: RankedInfo[];
    lastChampionName?: string;
};

// Props received from parent (e.g., summonerName)
type ProfileCardProps = {
    summonerName: string;
};

export default function ProfileCard({ summonerName }: ProfileCardProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [textColor, setTextColor] = useState("#fff");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [typedText, setTypedText] = useState("");
    const defaultIconId = 29;

    const bannerChampion = profile?.lastChampionName || "Lux";
    const bannerUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${bannerChampion}_0.jpg`;

    useEffect(() => {
        if (!summonerName) return;

        async function fetchProfile() {
            setLoading(true);
            try {
                const res = await fetch(`/api/summonerData?summonerName=${encodeURIComponent(summonerName)}`);
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setProfile(data);
            } catch (err: unknown) {
                let message = "Unknown error";
                if (err instanceof Error) message = err.message;
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [summonerName]);

    // Real typing effect
    useEffect(() => {
        if (loading) {
            const text = "Summoning your champion...";
            let idx = 0;
            const interval = setInterval(() => {
                setTypedText(text.slice(0, idx + 1));
                idx++;
                if (idx === text.length) clearInterval(interval);
            }, 100); // typing speed
            return () => clearInterval(interval);
        } else {
            setTypedText(""); // clear after loading
        }
    }, [loading]);

    // Analyze banner image brightness to dynamically set text color
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = bannerUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;

            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 100, 100).data;

                let r = 0, g = 0, b = 0;
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                }

                const pixels = imageData.length / 4;
                const brightness = (r + g + b) / (pixels * 3);
                setTextColor(brightness > 130 ? "#000" : "#fff");
            }
        };
    }, [bannerUrl]);

    const calcWinRate = (wins: number, losses: number) =>
        wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);

    const soloQ = Array.isArray(profile?.ranked)
        ? profile.ranked.find((r) => r.queueType === "RANKED_SOLO_5x5")
        : null;

    const flexQ = Array.isArray(profile?.ranked)
        ? profile.ranked.find((r) => r.queueType === "RANKED_FLEX_SR")
        : null;

    return (
        <Box sx={{ p: 4 }}>
            {/* Loading typing animation */}
            {loading && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 300,
                        gap: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            fontFamily: "monospace",
                            fontSize: "1.5rem",
                            color: "black", 
                        }}
                    >
                        {typedText}
                    </Typography>
                </Box>
            )}

            {/* Error message */}
            {error && <Typography color="error">{error}</Typography>}

            {/* Profile display */}
            {profile && !loading && (
                <Box
                    sx={{
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center 25%",
                        backgroundRepeat: "no-repeat",
                        borderRadius: 3,
                        p: 3,
                        color: textColor,
                        minHeight: 230,
                        maxHeight: 250,
                        position: "relative",
                        boxShadow: 4,
                        overflow: "hidden",
                    }}
                >
                    {/* Avatar and name */}
                    <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                            src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${profile.profileIconId ?? defaultIconId}.png`}
                            sx={{ width: 80, height: 80, border: `2px solid ${textColor}` }}
                        />
                        <Box>
                            <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
                                {profile.gameName}#{profile.tagLine}
                                <VerifiedIcon fontSize="small" sx={{ ml: 1, color: "#1DA1F2" }} />
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Ranked stats display */}
                    <Stack direction="row" spacing={6} mt={4}>
                        {/* Ranked Solo */}
                        <Box>
                            <Typography variant="body1" fontWeight="bold">Ranked Solo</Typography>
                            {soloQ ? (
                                <>
                                    <Typography fontWeight="bold">{soloQ.tier} {soloQ.rank}</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: textColor === "#fff" ? "#ddd" : "#222" }}>
                                        {soloQ.leaguePoints} LP · {soloQ.wins}W {soloQ.losses}L · {calcWinRate(soloQ.wins, soloQ.losses)}%
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography fontWeight="bold">Unranked</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: textColor === "#fff" ? "#ddd" : "#222" }}>
                                        0W 0L · 0%
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Ranked Flex */}
                        <Box>
                            <Typography variant="body1" fontWeight="bold">Ranked Flex</Typography>
                            {flexQ ? (
                                <>
                                    <Typography fontWeight="bold">{flexQ.tier} {flexQ.rank}</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: textColor === "#fff" ? "#ddd" : "#222" }}>
                                        {flexQ.leaguePoints} LP · {flexQ.wins}W {flexQ.losses}L · {calcWinRate(flexQ.wins, flexQ.losses)}%
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography fontWeight="bold">Unranked</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color: textColor === "#fff" ? "#ddd" : "#222" }}>
                                        0W 0L · 0%
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}
