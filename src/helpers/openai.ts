import { Configuration, OpenAIApi } from 'openai';

const OPEN_AI_TEXT_MODEL = 'text-davinci-003';

export const defaultOpenAIConfiguration = {
  model: OPEN_AI_TEXT_MODEL,
  temperature: 0.2,
  max_tokens: 3000,
  top_p: 1,
  frequency_penalty: 0.5,
  presence_penalty: 0,
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
