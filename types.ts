
export interface UserProfile {
  id: number | string;
  username: string;
  email?: string;
  is_guest: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SummaryStats {
  total_equipment_count: number;
  average_flowrate: number;
  average_pressure: number;
  average_temperature: number;
  distribution_by_type: Record<string, number>;
}

export interface EquipmentItem {
  id: number;
  equipment_name: string;
  type: string;
  flowrate: number;
  pressure: number;
  temperature: number;
}

export interface DatasetHistory {
  id: number;
  filename: string;
  timestamp: string;
  summary: SummaryStats;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens, user: UserProfile, remember: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}
