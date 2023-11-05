import { NextApiRequest, NextApiResponse } from 'next';
import { defaultOpenAIConfiguration, openai } from '../../../helpers/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message } = req.body;
    const response = await openai.createCompletion({
      ...defaultOpenAIConfiguration,
      prompt: `${message}`,
    });

    res.status(200).json({
      bot: response.data.choices[0].text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error ?? 'Something went wrong' });
  }
}
