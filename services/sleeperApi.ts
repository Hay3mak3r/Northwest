
import { League, User, Roster, Matchup, NflPlayer, TradedPick } from '../types';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export const fetchLeagueData = async (leagueId: string): Promise<League> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}`);
  if (!response.ok) throw new Error('Failed to fetch league');
  return response.json();
};

export const fetchLeagueUsers = async (leagueId: string): Promise<User[]> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchLeagueRosters = async (leagueId: string): Promise<Roster[]> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
  if (!response.ok) throw new Error('Failed to fetch rosters');
  return response.json();
};

export const fetchMatchups = async (leagueId: string, week: number): Promise<Matchup[]> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/matchups/${week}`);
  if (!response.ok) throw new Error(`Failed to fetch matchups for week ${week}`);
  return response.json();
};

export const fetchPlayoffBracket = async (leagueId: string): Promise<any[]> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/winners_bracket`);
  if (!response.ok) throw new Error('Failed to fetch playoff bracket');
  return response.json();
};

export const fetchTradedPicks = async (leagueId: string): Promise<TradedPick[]> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/traded_picks`);
  if (!response.ok) throw new Error('Failed to fetch traded picks');
  return response.json();
};

export const fetchNflPlayers = async (): Promise<Record<string, NflPlayer>> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/players/nfl`);
  if (!response.ok) throw new Error('Failed to fetch NFL players');
  return response.json();
};

export const fetchNflState = async (): Promise<any> => {
  const response = await fetch(`${SLEEPER_BASE_URL}/state/nfl`);
  if (!response.ok) throw new Error('Failed to fetch NFL state');
  return response.json();
};
