// File: app/page.tsx
// Author: Alex Chen (achen119@bu.edu), 4/18/2025, Jihye Lee (jh020211@bu.edu) 4/25/2025 (updated)
// Description: Home page that allows user to search their Riot Games ID to display profile and match history

"use client";
import { Box, Typography, Container } from "@mui/material";
export default function Home() {
    return (
        <>
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(to bottom, #f2eafa, #ffffff)",
                    px: 4,
                    textAlign: "center",
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Welcome to Summoner's Archive!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        This app lets you explore <strong>summoner</strong> profiles and view their recent match history.
                        Simply type a summoner name and tag, then hit <strong>Search</strong> to uncover their stats and champion highlights!
                    </Typography>
                </Container>
            </Box>
        </>
    );
}
