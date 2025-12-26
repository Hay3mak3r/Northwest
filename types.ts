
export interface League {
  id: string;
  name: string;
  season: string;
  status: string;
  settings: {
    leg: number;
    last_scored_leg: number;
    playoff_start_week: number;
    playoff_teams?: number;
    playoff_type?: number;
    trade_deadline: number;
    num_teams: number;
    type: number;
  };
  scoring_settings: Record<string, number>;
  roster_positions: string[];
}

export interface User {
  user_id: string;
  display_name: string;
  avatar?: string;
  metadata: {
    team_name?: string;
  };
}

export interface Roster {
  roster_id: number;
  owner_id: string;
  players: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal: number;
    fpts_against: number;
    fpts_against_decimal: number;
    ppts?: number;
    ppts_decimal?: number;
  };
}

export interface NflPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  position: string;
  team: string;
  full_name?: string;
  status?: string;
  injury_status?: string;
  active?: boolean;
}

export interface Matchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  custom_points?: number;
  players: string[];
  players_points?: Record<string, number>;
}

export interface PlayerHighlight {
  player_id: string;
  player_name: string;
  points: number;
  owner_name: string;
  highlight_text: string;
}

export interface MatchupRecap {
  matchup_id: number;
  recap: string;
}

export interface TradedPick {
  season: string;
  round: number;
  roster_id: number; // Original owner
  previous_owner_id: number;
  owner_id: number; // Current owner
}

export interface PowerRanking {
  roster_id: number;
  team_name: string;
  owner_name: string;
  avatar?: string;
  wins: number;
  losses: number;
  fpts: number;
  fpts_against: number;
  all_play_wins: number;
  all_play_losses: number;
  all_play_ties: number;
  power_score: number;
  actual_rank: number;
  rank: number;
}
