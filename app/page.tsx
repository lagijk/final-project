// File: app/page.tsx
// Author: Alex Chen (achen119@bu.edu), 4/18/2025, Jihye Lee (jh020211@bu.edu) 4/24/2025 (updated)
// Description: home page that allows user to search their riot games id to display profile and match history

"use client";
import { useState } from "react";
import MatchHistory from "@/components/match-history";
import ProfileCard from "@/components/ProfileCard";
import {Box, Stack, TextField, Button, Typography} from "@mui/material";

export default function Home() {
    const [summonerName, setSummonerName] = useState("");
    const [input, setInput] = useState("");

    const handleSearch = () => {
        const cleaned = input.replace(/\s+/g, "").trim();
        setSummonerName(cleaned);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography>Recent Match History</Typography>
            <Stack direction="row" spacing={2} mb={4}>
                <TextField
                    label="Game name #Game tag"
                    value={input}
                    required
                    fullWidth
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                >
                    Search
                </Button>
            </Stack>
            <ProfileCard summonerName={summonerName} />
            <MatchHistory summonerName={summonerName} />
        </Box>
    );
}
