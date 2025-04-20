// File: type.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: Exports match type and player type

export type Match = {
    gameMode: string;
    win: boolean;
    participants: Player[]
    player: Player; //searched user's participant info
    gameName: string; //searched user's riot game name
};

export type Player = {
    championName: string;
    champLevel: number;
    summonerLevel: number;
    kills: number;
    deaths: number;
    assists: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalMinionsKilled: number;
    goldEarned: number;
    wardsPlaced: number;
    wardsKilled: number;
    item: number[];
};

