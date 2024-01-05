'use client';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import mondaySdk from 'monday-sdk-js';

const Prompt = () => {
  const messageInput = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mondayContext, setMondayContext] = useState({});

  const monday = mondaySdk();

  const handleEnter = async (e: React.KeyboardEvent<HTMLTextAreaElement> & React.FormEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      setIsLoading(true);
      await handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = messageInput.current?.value;
    if (message !== undefined) {
      setIsLoading(true);
      messageInput.current!.value = '';
    }
    if (!message) {
      return;
    }
    try {
      const { data } = await axios.post('/api/server/completion-response', {
        message,
      });
      insertBotTextAndClose(data.bot);
    } catch (e: any) {
      console.error('Could not complete action, error was', e);
    } finally {
      monday.execute('closeDocModal');
      setIsLoading(false);
    }
  };

  const insertBotTextAndClose = (text: string) => {
    // @ts-ignore
    const { focusedBlocks } = mondayContext.data;
    const blockId = focusedBlocks[0].id;

    monday.execute('addDocBlock', {
      type: 'normal text',
      content: { deltaFormat: [{ insert: text }] },
      afterBlockId: blockId,
    });
  };

  useEffect(() => {
    async function setMondayCtx() {
      const ctx = await monday.get('context');
      setMondayContext(ctx);
    }
    setMondayCtx();
  }, [monday]);

  return (
    <div className="h-48">
      {isLoading ? (
        <div className="h-full grid-cols-3 gap-4 content-center flex justify-center items-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="h-full">
          <textarea
            className="rounded-lg resize-none w-full h-full block p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            name="Message"
            placeholder="Type your prompt here (and hit enter)"
            ref={messageInput}
            onKeyDown={handleEnter}
          />
        </form>
      )}
    </div>
  );
};

export default Prompt;
