// File: type.ts
// Author: Alex Chen (achen119@bu.edu), 4/18/2025, Yutong Qin (yutongq@bu.edu), 4/26/2025 (updated)
// Description: Exports match type and player type, and types for leaderboard

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

export type MiniSeriesDTO = {
    losses: number;
    progress: string;
    target: number;
    wins: number;
}

export type LeagueItemDTO = {
  freshBlood: boolean;
  wins: number;
  miniSeries?: MiniSeriesDTO;
  inactive: boolean;
  veteran: boolean;
  hotStreak: boolean;
  rank: string;
  leaguePoints: number;
  losses: number;
  summonerId: string;
  puuid: string;
}

export type LeagueListDTO = {
  leagueId: string;
  entries: LeagueItemDTO[];
  tier: string;
  name: string;
  queue: string
}