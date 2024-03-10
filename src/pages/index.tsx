import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';
import { storage } from '../helpers/storage/client';
import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';
import MobileSidebar from '../components/MobileSidebar';
import { mondayViewAuthentication } from '../helpers/auth';
import { Prompt } from '../types/chat';
import { ConversationProvider } from '../state/ConversationProvider';
import { MondayContext } from '../state/context';
import type { BaseContext } from 'monday-sdk-js/types/client-context.type';

const monday = mondaySdk();
export default function Home() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [prompts, setPrompts] = useState([] as Prompt[]);
  const [context, setMondayContext] = useState({} as BaseContext);

  useEffect(() => {
    monday.execute('valueCreatedForUser');
    async function setMondayCtx() {
      const ctx = (await monday.get('context')) as { data: BaseContext };

      setMondayContext(ctx.data);
    }
    setMondayCtx();
  }, []);


  useEffect(() => {
    async function getPromptsFromStorage() {
      if (!context?.user?.id) return;
      const prompts = await storage().getItem(`prompts_${context?.user?.id}`);
      if (prompts) {
        setPrompts(JSON.parse(prompts));
      }
    }

    getPromptsFromStorage();
  }, [context?.user?.id]);

  const toggleComponentVisibility = () => {
    setIsComponentVisible(!isComponentVisible);
  };

  return (
    <MondayContext.Provider value={{ context }}>
      <main className="overflow-hidden w-full h-screen relative flex">
        <ConversationProvider props={{ setPrompts, prompts }}>
          {isComponentVisible ? <MobileSidebar toggleComponentVisibility={toggleComponentVisibility} /> : null}
          <div className="dark hidden flex-shrink-0 bg-gray-900 md:flex md:w-[260px] md:flex-col">
            <div className="flex h-full min-h-0 flex-col ">
              <Sidebar />
            </div>
          </div>
          <Chat toggleComponentVisibility={toggleComponentVisibility} />
        </ConversationProvider>
      </main>
    </MondayContext.Provider>
  );
}

export const getServerSideProps = async (context) => {
  // validate that view is loaded in monday
  mondayViewAuthentication(context.query);
  return { props: {} };
};
