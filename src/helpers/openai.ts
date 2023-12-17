import { Configuration, OpenAIApi } from 'openai';
import {envGet} from "./env";

const configuration = new Configuration({
  apiKey: envGet('OPENAI_API_KEY'),
});

export const openai = new OpenAIApi(configuration);
