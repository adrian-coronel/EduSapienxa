export interface AgentConfig {
  id: string;
  agentKey: string;
  name: string;
  description?: string;
  model: string;
  temperature: number;
  maxTokens?: number;
  memoryWindow: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfigDetail extends AgentConfig {
  systemPrompt: string;
}

export interface CreateAgentConfigDto {
  agentKey: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature?: number;
  memoryWindow?: number;
  maxTokens?: number;
  description?: string;
}

export interface UpdateAgentConfigDto {
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  memoryWindow: number;
  isActive: boolean;
  maxTokens?: number;
  description?: string;
}
