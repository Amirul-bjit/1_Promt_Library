export interface Prompt {
  id: number;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category: string;
  tags: string[];
  current_version: number | null;
  current_version_data?: PromptVersion;
  versions_count: number;
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
  created_by_username: string;
}

export interface PromptVersion {
  id: number;
  version_number: number;
  content: string;
  variables: string[];
  model_config: Record<string, any>;
  change_notes: string;
  created_at: string;
  created_by_username: string;
}

export interface Execution {
  id: number;
  prompt: number;
  prompt_title: string;
  prompt_version: number;
  provider: "OPENAI" | "ANTHROPIC";
  model: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  input_variables: Record<string, any>;
  rendered_prompt: string;
  response: string;
  tokens_used: number | null;
  cost: string | null;
  duration_ms: number | null;
  error_message: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DashboardMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
  provider_breakdown: Record<string, number>;
}
