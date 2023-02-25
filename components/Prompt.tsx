'use client';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import Image from 'next/image'
import mondaySdk from "monday-sdk-js";

interface ModelType {
  object: 'engine';
  id: string;
  ready: boolean;
  owner: string;
  permissions: null;
  created: string;
}

const Prompt = () => {
  const messageInput = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<any[]>([]);
  const [currentModel, setCurrentModel] = useState('text-davinci-003');
  const [mondayContext, setMondayContext] = useState({});

  const monday = mondaySdk();

  const handleEnter = (
    e: React.KeyboardEvent<HTMLTextAreaElement> &
      React.FormEvent<HTMLFormElement>
  ) => {
    if (e.key === 'Enter' && isLoading === false) {
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
      const { data } = await axios.post('/api/response', {
        message,
        currentModel,
      });
      insertBotTextAndClose(data.bot);
    } catch (e: any) {
      console.error('Could not complete action, error was', e);
    } finally {
      // @ts-ignore
      monday.execute('closeDocModal');
      setIsLoading(false);
    }
  };

  const insertBotTextAndClose = (text: string) => {
    // @ts-ignore
    const { focusedBlocks } = mondayContext.data;
    const blockId = focusedBlocks[0].id;

    // @ts-ignore
    monday.execute('addDocBlock', {
      type: 'normal text',
      content: { deltaFormat: [{ insert: text }] },
      after_block_id: blockId
    });
  };

  useEffect(() => {
    async function setMondayCtx() {
      const ctx = await monday.get('context');
      setMondayContext(ctx);
    }
    setMondayCtx();
  }, []);

  const fetcher = async () => {
    const models = await (await fetch('/api/models')).json();
    setModels(models.data);
    const modelIndex = models.data.findIndex(
      (model: ModelType) => model.id === 'text-davinci-003'
    );
    setCurrentModel(models.data[modelIndex].id);
    return models;
  };

  useSWR('fetchingModels', fetcher);

  return (
    <div>
      {isLoading ? (<div className="loader-wrapper"><span className="loader"></span></div>) :
      (<form onSubmit={handleSubmit}>
        <textarea
          name='Message'
          placeholder='Type your prompt here (and hit enter)'
          ref={messageInput}
          onKeyDown={handleEnter}
        />
      </form>)}
    </div>
  );
};

export default Prompt;
