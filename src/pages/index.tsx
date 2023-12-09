import { useState } from 'react';
import { PromptsContext } from '../helpers/context';

import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';
import MobileSidebar from '../components/MobileSidebar';
import { GetServerSideProps } from 'next';
import * as querystring from 'querystring';
import { MONDAY_OAUTH_AUTH_URL } from '../constants/monday';
import { getMondayToken } from '../helpers/token-storage';
import { storage } from '../helpers/storage/server';
import { mondayViewAuthentication } from '../helpers/auth';

export default function Home({ data }) {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [prompts, setPrompts] = useState(data ?? []);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <main className="overflow-hidden w-full h-screen relative flex">
      {isComponentVisible ? <MobileSidebar toggleComponentVisibility={toggleComponentVisibility} /> : null}
      <PromptsContext.Provider value={{ prompts, setPrompts }}>
        <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[260px] md:flex-col">
          <div className="flex h-full min-h-0 flex-col ">
            <Sidebar />
          </div>
        </div>
        <Chat toggleComponentVisibility={toggleComponentVisibility} />
      </PromptsContext.Provider>
    </main>
  );
}

export const getServerSideProps = (async (context) => {
  const { accountId, userId } = mondayViewAuthentication(context.query);
  const mondayToken = await getMondayToken(accountId, userId);

  if (!mondayToken) {
    return mondayAuthorize();
  }

  const data = await storage(mondayToken).getItemAsArray('prompts');

  return { props: { data } };
}) satisfies GetServerSideProps<{
  data: any;
}>;

const mondayAuthorize = () => {
  const path =
    MONDAY_OAUTH_AUTH_URL +
    '?' +
    querystring.stringify({
      client_id: process.env.MONDAY_APP_CLIENT_ID,
      redirect_uri: process.env.MONDAY_APP_AUTH_CALLBACK_URL,
      scopes: 'me:read boards:read',
      app_version_id: 10163336,
    });

  return {
    redirect: {
      destination: path,
      permanent: false,
    },
  };
};
