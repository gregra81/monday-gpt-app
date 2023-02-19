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

const Form = () => {
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
    console.log('works 1');
    if (!message) {
      return;
    }
    console.log('works 2');
    try {
      const { data } = await axios.post('/api/response', {
        message,
        currentModel,
      });
      insertBotTextAndClose(data.bot);
      console.log('works 3');
    } catch (e: any) {
      console.error('Could not complete action, error was', e);
      console.log('works 4');
    } finally {
      // @ts-ignore
      monday.execute('closeDocModal');
      setIsLoading(false);
      console.log('works 5');
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
    <div className='flex justify-center bg-gray-700' style={{ position: 'relative', zIndex: 10000 }}>
      {isLoading ? (<Image src="/Spinner-1s-200px.svg" alt="loader" height={150} width={150} />) :
      (<form
        onSubmit={handleSubmit}
        className='w-full fixed bottom-0 bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)]'
        style={{ height: '150px' }}
      >
        <textarea
          name='Message'
          placeholder='Type your prompt here (and hit enter)'
          ref={messageInput}
          onKeyDown={handleEnter}
          className='w-full resize-none bg-transparent outline-none pt-4 pl-4 translate-y-1 max-h-screen'
        />
      </form>)}
    </div>
  );
};

export default Form;
