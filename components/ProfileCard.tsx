"use client";
import { Box, Avatar, Typography, Stack } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useEffect, useState } from "react";

type RankedInfo = {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
};

type ProfileProps = {
    gameName: string;
    tagLine: string;
    profileIconId: number;
    mainChampionName?: string;
    ranked: RankedInfo[];
};

export default function ProfileCard({
                                        gameName,
                                        tagLine,
                                        profileIconId,
                                        mainChampionName = "Garen",
                                        ranked,
                                    }: ProfileProps) {
    const [textColor, setTextColor] = useState("#fff");

    const soloQ = ranked.find((r) => r.queueType === "RANKED_SOLO_5x5");
    const flexQ = ranked.find((r) => r.queueType === "RANKED_FLEX_SR");

    const calcWinRate = (wins: number, losses: number) =>
        wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);


    const bannerUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${mainChampionName}_0.jpg`;

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = bannerUrl;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, 50, 50).data;

                let r = 0, g = 0, b = 0;
                for (let i = 0; i < imageData.length; i += 4) {
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                }

                const pixels = imageData.length / 4;
                const brightness = (r + g + b) / (pixels * 3);
                setTextColor(brightness > 130 ?  "#fff" : "#000");
            }
        };
    }, [bannerUrl]);

    return (
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
            <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                    src={`https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${profileIconId}.png`}
                    sx={{ width: 80, height: 80, border: `2px solid ${textColor}` }}
                />
                <Box>
                    <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center">
                        {gameName}#{tagLine}
                        <VerifiedIcon fontSize="small" sx={{ ml: 1, color: textColor }} />
                    </Typography>
                </Box>
            </Stack>

            <Stack direction="row" spacing={6} mt={4}>
                {/* Ranked Solo */}
                <Box>
                    <Typography variant="body1" fontWeight="bold">Ranked Solo</Typography>
                    {soloQ ? (
                        <>
                            <Stack direction="row" spacing={1} alignItems="center">

                                <Typography fontWeight="bold">
                                    {soloQ.tier} {soloQ.rank}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: textColor === "#fff" ? "gray" : "#444" }}>
                                {soloQ.leaguePoints} LP · {soloQ.wins}W {soloQ.losses}L · {calcWinRate(soloQ.wins, soloQ.losses)}%
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography fontWeight="bold">Unranked</Typography>
                            <Typography variant="body2" sx={{ color: textColor === "#fff" ? "gray" : "#444" }}>0W 0L · 0%</Typography>
                        </>
                    )}
                </Box>

                {/* Ranked Flex */}
                <Box>
                    <Typography variant="body1" fontWeight="bold">Ranked Flex</Typography>
                    {flexQ ? (
                        <>
                            <Stack direction="row" spacing={1} alignItems="center">

                                <Typography fontWeight="bold">
                                    {flexQ.tier} {flexQ.rank}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: textColor === "#fff" ? "gray" : "#444" }}>
                                {flexQ.leaguePoints} LP · {flexQ.wins}W {flexQ.losses}L · {calcWinRate(flexQ.wins, flexQ.losses)}%
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography fontWeight="bold">Unranked</Typography>
                            <Typography variant="body2" sx={{ color: textColor === "#fff" ? "gray" : "#444" }}>0W 0L · 0%</Typography>
                        </>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
