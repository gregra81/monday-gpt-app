import type { NextApiRequest, NextApiResponse } from 'next';
import initMondayClient from 'monday-sdk-js';
import { Logger } from '@mondaycom/apps-sdk';

import { defaultOpenAIConfiguration, openai } from '../../../helpers/openai';
import { mondayWorkflowAuthentication } from '../../../helpers/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const logger = new Logger('AI_ASSISTANT');

  try {
    const { shortLivedToken } = mondayWorkflowAuthentication(req, res);
    const { itemId, updateId } = req?.body?.payload?.inputFields;

    if (!itemId || !updateId) {
      logger.error('Missing integration input(s) itemId, updateId');
      return res.status(400).json({ error: 'Integration input(s) are missing' });
    }
    const mondayClient = initMondayClient({ token: shortLivedToken, apiVersion: '2023-10' });

    const itemUpdates = await mondayClient.api(
      `query { items(ids: [${itemId}]) { updates(ids: [${updateId}]) { body } } }`,
    );

    const respBody = itemUpdates.data.items[0].updates[0].body;

    if (!respBody) {
      logger.warn(`No updates from monday API for item ${itemId}`);
      return res.status(400).json({ error: `No updates from monday API for item ${itemId}` });
    }

    const response = await getOpenAiResponse(respBody);

    if (response.data.choices[0].text) {
      const item = await respondToItem(shortLivedToken, itemId, response.data.choices[0].text);
      return res.status(200).json({ message: 'Success' });
    } else {
      logger.info(`No response from OpenAI for item ${itemId}`);
      return res.status(200).json({ error: 'No response from OpenAI.' });
    }
  } catch (error: any) {
    logger.error(`Error in AI Assistant integration: ${error}`);
    res.status(401).json({ message: error?.message ?? 'Something went wrong' });
  }
}

const getOpenAiResponse = async (message: string) => {
  return await openai.createCompletion({
    ...defaultOpenAIConfiguration,
    prompt: `${message}`,
  });
};

async function respondToItem(shortLivedToken: string, itemId: string, response: string) {
  // We need to create a new update in the monday item using the public api
  const mondayClient = initMondayClient({ token: shortLivedToken, apiVersion: '2023-10' });
  const createUpdate = `mutation {
        create_update (
            item_id: ${itemId},
            body: "${response}"
        ) {
            id
        }
    }`;
  return await mondayClient.api(createUpdate);
}
