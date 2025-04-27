// File: app/leaderboard/page.tsx
// Author: Yutong Qin (yutongq@bu.edu), 4/26/2025
// Description: A frontend page that displays and allows users to check the leaderboard of ranked solo and flex queues

"use client";

import { Box, Typography } from "@mui/material";
import LeaderBoard from "@/components/LeaderBoard";

export default function LeaderBoardPage() {
    // there are two valid queues in the game
    const leaderboardId = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Top Ranked Players
            </Typography>

            <Typography variant="body1" mb={4}>
                View the top-ranked players in Ranked Solo and Ranked Flex queues.
            </Typography>

            {/* Leaderboard Component */}
            <LeaderBoard leaderboardId={leaderboardId} />
        </Box>
    );
}
