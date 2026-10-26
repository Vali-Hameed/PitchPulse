/**
 * TypeScript definitions matching backend Pydantic models for PitchPulse Studio.
 */

export type TeamCode = "NLR" | "MSB";

export type EventType =
  | "pass"
  | "shot"
  | "tackle"
  | "interception"
  | "pressure"
  | "carry"
  | "turnover"
  | "goal";

export type OverlayType =
  | "line_breaking_pass"
  | "high_press_turnover"
  | "chaos_surge"
  | "goal_threat"
  | "sprint_alert";

export type PersonaMode = "analyst" | "casual" | "player_focus";
export type LanguageCode = "en" | "es" | "ar" | "ko" | "fr" | "pt" | "de";

export interface VisionDetection {
  tracking_id: string;
  label: "player_nlr" | "player_msb" | "goalkeeper" | "ball" | "referee";
  shirt_number?: number | null;
  player_name?: string | null;
  confidence: number;
  box_2d: number[]; // [ymin, xmin, ymax, xmax]
  pitch_x: number;
  pitch_y: number;
}

export interface VisionFrameResponse {
  frame_id: number;
  match_clock: string;
  fps: number;
  inference_latency_ms: number;
  detections: VisionDetection[];
  model_name: string;
  homography_matrix_status: string;
}

export interface PlayerPosition {
  player_id: string;
  name: string;
  shirt_number: number;
  team: TeamCode;
  x: number; // 0.0 - 105.0 meters
  y: number; // 0.0 - 68.0 meters
  speed_kmh: number;
  stamina_pct: number;
}

export interface PlayerRosterInfo {
  id: string;
  name: string;
  number: number;
  team: TeamCode;
  role: string;
}

export const ALL_PLAYERS: PlayerRosterInfo[] = [
  // NLR (North London Red)
  { id: "NLR-1", name: "D. Raya-Sim", number: 1, team: "NLR", role: "GK" },
  { id: "NLR-18", name: "J. Timber-Sim", number: 18, team: "NLR", role: "LB" },
  { id: "NLR-6", name: "G. Magalhaes-Sim", number: 6, team: "NLR", role: "CB" },
  { id: "NLR-2", name: "W. Saliba-Sim", number: 2, team: "NLR", role: "CB" },
  { id: "NLR-4", name: "B. White-Sim", number: 4, team: "NLR", role: "RB" },
  { id: "NLR-5", name: "T. Partey-Sim", number: 5, team: "NLR", role: "DM" },
  { id: "NLR-20", name: "D. Rice-Sim", number: 20, team: "NLR", role: "CM" },
  { id: "NLR-8", name: "M. Vance-Sim", number: 8, team: "NLR", role: "AM" },
  { id: "NLR-11", name: "G. Martinelli-Sim", number: 11, team: "NLR", role: "LW" },
  { id: "NLR-9", name: "K. Havertz-Sim", number: 9, team: "NLR", role: "CF" },
  { id: "NLR-7", name: "B. Saka-Sim", number: 7, team: "NLR", role: "RW" },
  // MSB (Merseyside Blue)
  { id: "MSB-1", name: "J. Pickford-Sim", number: 1, team: "MSB", role: "GK" },
  { id: "MSB-19", name: "V. Mykolenko-Sim", number: 19, team: "MSB", role: "LB" },
  { id: "MSB-32", name: "J. Branthwaite-Sim", number: 32, team: "MSB", role: "CB" },
  { id: "MSB-6", name: "J. Tarkowski-Sim", number: 6, team: "MSB", role: "CB" },
  { id: "MSB-2", name: "N. Patterson-Sim", number: 2, team: "MSB", role: "RB" },
  { id: "MSB-27", name: "I. Gueye-Sim", number: 27, team: "MSB", role: "DM" },
  { id: "MSB-8", name: "A. Onana-Sim", number: 8, team: "MSB", role: "CM" },
  { id: "MSB-16", name: "A. Doucoure-Sim", number: 16, team: "MSB", role: "CM" },
  { id: "MSB-7", name: "D. McNeil-Sim", number: 7, team: "MSB", role: "LW" },
  { id: "MSB-9", name: "D. Calvert-Sim", number: 9, team: "MSB", role: "CF" },
  { id: "MSB-11", name: "J. Harrison-Sim", number: 11, team: "MSB", role: "RW" },
];

export interface BallPosition {
  x: number;
  y: number;
  z: number;
  speed_kmh: number;
}

export interface RawMatchEvent {
  event_id: number;
  match_clock: string;
  timestamp_sec: number;
  event_type: EventType;
  team: TeamCode;
  actor_id: string;
  actor_name: string;
  actor_number: number;
  target_id?: string | null;
  target_name?: string | null;
  target_number?: number | null;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  ball_speed_kmh: number;
  nearest_defender_dist_m: number;
  defenders_bypassed: number;
  players_snapshot: PlayerPosition[];
}

export interface ComputedMetrics {
  xt_start: number;
  xt_end: number;
  xt_delta: number;
  pass_difficulty_score: number;
  pressure_index: number;
  control_chaos_index: number;
  field_tilt_nlr_pct: number;
  sprint_burst_triggered: boolean;
  is_key_moment: boolean;
  trigger_reason?: string | null;
}

export interface CheckedClaim {
  claim: string;
  ground_truth: any;
  status: "MATCH" | "CORRECTED";
  metric_name: string;
}

export interface VerificationReceipt {
  verified: boolean;
  confidence_score: number;
  checked_claims: CheckedClaim[];
  source_event_ids: number[];
  correction_applied: boolean;
  audit_notes: string;
  raw_telemetry_snapshot: {
    event_id: number;
    match_clock: string;
    coordinates: {
      start: { x: number; y: number };
      end: { x: number; y: number };
    };
    nearest_defender_dist_m: number;
    defenders_bypassed: number;
    ball_speed_kmh: number;
    computed_xt_delta: number;
    pressure_index: number;
    verified_at_utc: string;
  };
}

export interface PersonaOutputs {
  analyst: string;
  casual: string;
  player_focus: string;
  player_cam_target_id?: string | null;
  translations: Partial<
    Record<
      LanguageCode,
      {
        headline: string;
        analyst: string;
        casual: string;
        player_focus: string;
      }
    >
  >;
}

export interface BroadcastOverlayPayload {
  overlay_id: string;
  match_clock: string;
  overlay_type: OverlayType;
  headline: string;
  subtext: string;
  highlight_player_ids: string[];
  vector_coords: {
    start_x: number;
    start_y: number;
    end_x: number;
    end_y: number;
  };
  metrics_badge: Record<string, string>;
  verification: VerificationReceipt;
  personas: PersonaOutputs;
  draft_narrative?: string | null;
  verified_narrative?: string | null;
  model_mode?: string | null;
  pipeline_latency_ms?: number | null;
}

export interface MatchTickPayload {
  match_clock: string;
  timestamp_sec: number;
  current_event: RawMatchEvent;
  metrics: ComputedMetrics;
  active_overlay?: BroadcastOverlayPayload | null;
}

export interface FramePayload {
  match_clock: string;
  timestamp_sec: number;
  players: PlayerPosition[];
  ball: BallPosition;
  is_cut?: boolean;
}

export interface ScoreState {
  nlr_score: number;
  msb_score: number;
  match_clock: string;
  status: "live" | "paused" | "halftime" | "fulltime";
}

export interface RecapBullet {
  minute: string;
  headline: string;
  text: string;
  event_id: number;
  tag: string;
  scenario_id?: string | null;
}

export interface StudioAskRequest {
  question: string;
  persona: PersonaMode;
  lang: LanguageCode;
  player_id?: string;
  club?: ClubLens;
}

export interface RecapResponse {
  match_clock: string;
  score: string;
  headline: string;
  bullets: RecapBullet[];
  persona: string;
  lang: string;
  club: string;
}

export interface HealthResponse {
  status: string;
  model_mode: string;
  hosting_label: string;
  running_on_aca: boolean;
  avg_pipeline_latency_ms: number;
  last_pipeline_latency_ms: number;
  grounded_pct: number;
  uptime_s: number;
}

export type MetricLens = "all" | "xt" | "difficulty" | "pressure" | "speed";
export type ClubLens = "ALL" | "NLR" | "MSB";

export interface CustomEventIngestRequest {
  match_clock?: string | null;
  event_type: EventType;
  team: TeamCode;
  actor_id: string;
  target_id?: string | null;
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  ball_speed_kmh: number;
  nearest_defender_dist_m: number;
  defenders_bypassed: number;
  forced_draft?: string | null;
}

export const CULTURAL_DIALECT_LABELS: Record<
  LanguageCode,
  { region: string; dialect: string }
> = {
  en: { region: "UK / Global", dialect: "Sky MNF Tactical Punditry" },
  es: { region: "España / LatAm", dialect: "Pizarra & Radio Táctica LaLiga" },
  ar: { region: "MENA", dialect: "استوديو تحليلي عربي (beIN Style)" },
  ko: { region: "Korea", dialect: "SPOTV K-택틱스 생중계" },
  fr: { region: "France", dialect: "Palette Tactique Canal+" },
  pt: { region: "Brasil / PT", dialect: "Mesa Tática Brasileirão" },
  de: { region: "DACH", dialect: "Bundesliga Halbraum & Gegenpressing" },
};
