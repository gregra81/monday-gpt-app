import { NextApiRequest, NextApiResponse } from 'next';
import { ChatCompletionRequestMessage } from 'openai';
import { OpenAIModel } from '../../../types/model';
import { openai } from '../../../helpers/openai';
import { Logger } from '@mondaycom/apps-sdk';
import { DEFAULT_OPENAI_MODEL } from '../../../constants/openai';
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
    const promptMessage: ChatCompletionRequestMessage = {
      role: 'system',
      content: 'You are ChatGPT. Respond to the user like you normally would.',
    };
    const initialMessages: ChatCompletionRequestMessage[] = messages.splice(0, 3);
    const latestMessages: ChatCompletionRequestMessage[] = messages.slice(-5).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const completion = await openai.createChatCompletion({
      model: model.id,
      temperature: 0.5,
      messages: [promptMessage, ...initialMessages, ...latestMessages],
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
