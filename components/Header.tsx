// File: app/components/Header.tsx
// Author: Jihye Lee (jh020211@bu.edu)
// Description: Top navigation bar component for the app

"use client";

import Link from "next/link";

import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

export default function Header() {
    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                {/*  App Title */}
                <Typography variant="h6" fontWeight="bold">
                    Summoner&apos;s Archive
                </Typography>

                {/* Navigation Links */}
                <Stack direction="row" spacing={2}>
                    <Button component={Link} href="/" color="inherit">
                        Home
                    </Button>
                    <Button component={Link} href="/search" color="inherit">
                        Search
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
