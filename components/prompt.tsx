'use client';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import mondaySdk from 'monday-sdk-js';
import css from './prompt.module.css';

const Prompt = () => {
  const messageInput = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mondayContext, setMondayContext] = useState({});

  const monday = mondaySdk();

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement> & React.FormEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      setIsLoading(true);
      handleSubmit(e);
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
      const { data } = await axios.post('/api/server/ai-response', {
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
    <div>
      {isLoading ? (
        <div className={css.loaderWrapper}>
          <span className={css.loader}></span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            className={css.textarea}
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
