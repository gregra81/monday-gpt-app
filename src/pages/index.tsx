import { useState, useEffect } from 'react';
import { PromptsContext } from '../state/context';

import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';
import MobileSidebar from '../components/MobileSidebar';
import { mondayViewAuthentication } from '../helpers/auth';
import { Prompt } from '../types/chat';
import { ConversationProvider } from '../state/ConversationProvider';
import useAppStorage from '../hooks/useAppStorage';

export default function Home() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const [prompts, setPrompts] = useState([] as Prompt[]);

  const { data, error, loading } = useAppStorage<Prompt[]>('prompts');
  useEffect(() => {
    if (data) {
      setPrompts(data);
    }
  }, [data]);

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

export const getServerSideProps = async (context) => {
  // validate that view is loaded in monday
  mondayViewAuthentication(context.query);
  return { props: {} };
};
