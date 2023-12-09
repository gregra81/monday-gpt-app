import { OpenAIModel } from '../types/model';
export const DEFAULT_OPENAI_MODEL = {
  name: 'Default (GPT-3.5)',
  id: 'gpt-3.5-turbo',
  available: true,
};

export const defaultOpenAICompletionConfiguration = {
  model: 'text-davinci-003',
  temperature: 0.2,
  max_tokens: 3000,
  top_p: 1,
  frequency_penalty: 0.5,
  presence_penalty: 0,
};

export const defaultOpenAIChatConfiguration = {
  model: DEFAULT_OPENAI_MODEL.id,
  temperature: 0.5,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0.5,
  presence_penalty: 0,
};
