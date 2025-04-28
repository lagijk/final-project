// File: app/components/ProfileLeaderboard.tsx
// Author: Yutong Qin (yutongq@bu.edu) 4/27/2025
// Description: Handles for the formatting of each top player's details information

"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Avatar, Stack } from "@mui/material";

// type for each top player's displayed or required information returned from API fetching
type ProfileLBProps = {
  summonerId: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  lbRank: number;
  profileIconId?: number;
  lastChampionName?: string;
  gameName?: string;
  tagLine?: string;
};

export default function ProfileLeaderboard({
  summonerId,
  leaguePoints,
  wins,
  losses,
  lbRank,
  profileIconId = 29,
  lastChampionName = "Lux",
  gameName,
  tagLine,
}: ProfileLBProps) {

  // hold the avatar url that dynamically changed based on user's profileIconId
  const avatarUrl = `https://ddragon.leagueoflegends.com/cdn/15.8.1/img/profileicon/${profileIconId}.png`;
  // hold the list of banner displayed for each player
  const [bannerUrl, setBannerUrl] = useState<string>(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg`);
  // hold for the state of text color
  const [textColor, setTextColor] = useState("#fff");

  // hold for the displayName on player profile
  // if no data matched, shows the slice of the first 8 character in their summonerId
  const displayName = gameName && tagLine
    ? `${gameName}#${tagLine}`
    : `${summonerId.slice(0, 8)}...`;

  useEffect(() => {
    if (!lastChampionName) return;

    // dynamically assign the banner image based on player's last match champion
    const tryUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${lastChampionName}_0.jpg`;
    const testBanner = new Image();
    testBanner.src = tryUrl;

    // if data fetched, display their last match champion
    // otherwise, the base handling is the default Lux
    testBanner.onload = () => setBannerUrl(tryUrl);
    testBanner.onerror = () =>
      setBannerUrl(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg`);
  }, [lastChampionName]);

  // dynamically set text color based on the brightness analysis of banner
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

  // calculate the winning rate based on fetched wins and losses
  const calcWinRate = (wins: number, losses: number) =>
    wins + losses === 0 ? 0 : Math.round((wins / (wins + losses)) * 100);

  return (
    // Profile display
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Profile section: avatar + displayName */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={avatarUrl}
          sx={{ width: 64, height: 64, border: `2px solid #fff` }}
        />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {summonerId.slice(0, 8)}...
          </Typography>
        </Box>
      </Stack>

      {/* Profile section: detailed info (LP/wins/rank/losses/win rate) for each player */}
      <Stack direction="row" spacing={4} mt={2}>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Leaderboard
          </Typography>
          <Typography fontWeight="bold">Rank #{lbRank}</Typography>
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            LP
          </Typography>
          <Typography fontWeight="bold">{leaguePoints} LP</Typography>
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Wins
          </Typography>
          <Typography fontWeight="bold">{wins} W</Typography>
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Losses
          </Typography>
          <Typography fontWeight="bold">{losses} L</Typography>
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Win Rate
          </Typography>
          <Typography fontWeight="bold">{calcWinRate(wins, losses)}%</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
