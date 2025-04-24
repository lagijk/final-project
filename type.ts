// File: type.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025
// Description: Exports match type and player type

export type Match = {
    gameMode: string;
    win: boolean;
    participants: Player[]
    player: Player | undefined; //searched user's participant info, uses undefined to assure ts it's ok if player is not found
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
    neutralMinionsKilled: number;
    goldEarned: number;
    wardsPlaced: number;
    wardsKilled: number;
    item: number[];
};

// raw type from riot games api to prevent using "any" as type which causes deployment error
export type MatchType = {
    info: {
      gameMode: string;
      participants: PlayerType[];
      teams: TeamType[];
    };
  };
  
export type PlayerType = {
    puuid: string;
    championName: string;
    champLevel: number;
    summonerLevel: number;
    kills: number;
    deaths: number;
    assists: number;
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    goldEarned: number;
    wardsPlaced: number;
    wardsKilled: number;
    item0: number;
    item1: number;
    item2: number;
    item3: number;
    item4: number;
    item5: number;
    item6: number;
    teamId: number;
  };
  
export type TeamType = {
    teamId: number;
    win: boolean;
  };

export type Profile = {
    gameName: string;
    tagLine: string;
    profileIconId: number;
    summonerLevel: number;
    puuid: string;
    ranked: RankedInfo[];
};

export type RankedInfo = {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
};
