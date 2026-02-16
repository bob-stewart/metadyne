export type IrbCase = {
  id: string;
  createdAt?: string;
  severity?: string;
  summary?: string;
  status?: string;
  affectedSurfaces?: string[];
  evidenceIds?: string[];
};

export type IrbBacklog = {
  schema: string;
  run: { timestamp_utc: string };
  proposals: Array<{
    id: string;
    title: string;
    risk: 'GREEN' | 'AMBER' | 'RED';
    surface: string;
    holon?: string;
    next_action: string;
  }>;
  links?: Record<string, unknown>;
};
