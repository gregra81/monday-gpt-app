import { NextApiRequest, NextApiResponse } from 'next';
import { ChatCompletionRequestMessage } from 'openai';
import { OpenAIModel } from '../../../types/model';
import { openai } from '../../../helpers/openai';
import { Logger } from '@mondaycom/apps-sdk';
import { DEFAULT_OPENAI_MODEL, defaultOpenAIChatConfiguration } from '../../../constants/openai';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = new Logger('CHAT_RESPONSE');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body;
  const messages = (body?.messages || []) as ChatCompletionRequestMessage[];
  const model = (body?.model || DEFAULT_OPENAI_MODEL) as OpenAIModel;

  try {
    const completion = await openai.createChatCompletion({
      ...defaultOpenAIChatConfiguration,
      messages: messages,
    });

    const responseMessage = completion.data.choices[0].message?.content.trim();

    if (!responseMessage) {
      res.status(400).json({ error: 'Unable get response from OpenAI. Please try again.' });
    }

    res.status(200).json({ message: responseMessage });
  } catch (error: any) {
    logger.error(`Error in AI chat response: ${error}`);
    res.status(500).json({
      error: 'An error occurred during ping to OpenAI. Please try again.',
    });
  }
}
