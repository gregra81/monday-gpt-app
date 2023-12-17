import { useState } from 'react';
import { PromptsContext } from '../state/context';

import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';
import MobileSidebar from '../components/MobileSidebar';
import { GetServerSideProps } from 'next';
import * as querystring from 'querystring';
import { MONDAY_OAUTH_AUTH_URL } from '../constants/monday';
import { getMondayToken } from '../helpers/token-storage';
import { storage } from '../helpers/storage/server';
import { mondayViewAuthentication } from '../helpers/auth';
import { Prompt } from '../types/chat';
import { ConversationProvider } from '../state/ConversationProvider';
import {envGet} from "../helpers/env";

export default function Home(props: { data: Prompt[] }) {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [prompts, setPrompts] = useState(props.data ?? []);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      <ConversationProvider>
        <PromptsContext.Provider value={{ setPrompts, prompts }}>
          {isComponentVisible ? <MobileSidebar toggleComponentVisibility={toggleComponentVisibility} /> : null}
          <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[260px] md:flex-col">
            <div className="flex h-full min-h-0 flex-col ">
              <Sidebar />
            </div>
          </div>
          <Chat toggleComponentVisibility={toggleComponentVisibility} />
        </PromptsContext.Provider>
      </ConversationProvider>
    </main>
  );
}

export const getServerSideProps = (async (context) => {
  const { accountId, userId } = mondayViewAuthentication(context.query);
  const mondayToken = await getMondayToken(accountId, userId);

  if (!mondayToken) {
    return mondayAuthorize();
  }

  const data = await storage(mondayToken).getItemAsArray<Prompt>('prompts');

  return { props: { data } };
}) satisfies GetServerSideProps<{
  data: Prompt[];
}>;

const mondayAuthorize = () => {
  const path =
    MONDAY_OAUTH_AUTH_URL +
    '?' +
    querystring.stringify({
      client_id: envGet('MONDAY_APP_CLIENT_ID'),
      redirect_uri: envGet('MONDAY_APP_AUTH_CALLBACK_URL'),
      scopes: 'me:read boards:read',
      app_version_id: envGet('DEV_APP_VERSION_ID'),
    });

  return {
    redirect: {
      destination: path,
      permanent: false,
    },
  };
};
