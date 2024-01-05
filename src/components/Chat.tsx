import { useContext, useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { BsPlusLg } from 'react-icons/bs';
import { RxHamburgerMenu } from 'react-icons/rx';
import Message from './Message';
import useAutoResizeTextArea from '../hooks/useAutoResizeTextArea';
import { PromptsContext, ConversationContext, PromptsContextSelected } from '../state/context';
import { storage } from '../helpers/storage/client';
import { DEFAULT_OPENAI_MODEL } from '../constants/openai';
import { getCurrentDate } from '../helpers/date';
import { Prompt } from '../types/chat';
import { generateUUID } from '../helpers/string';

const Chat = (props: any) => {
  const { toggleComponentVisibility } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmptyChat, setShowEmptyChat] = useState(true);
  const [message, setMessage] = useState('');
  const textAreaRef = useAutoResizeTextArea();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  const { prompts, setPrompts } = useContext(PromptsContext);
  const { conversation, setConversation } = useContext(ConversationContext);
  const { selectedPrompt, setSelectedPrompt } = useContext(PromptsContextSelected);

  const selectedModel = DEFAULT_OPENAI_MODEL;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '24px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const sendMessage = async (e: any) => {
    e.preventDefault();

    // Don't send empty messages
    if (message.length < 1) {
      setErrorMessage('Please enter a message.');
      return;
    } else {
      setErrorMessage('');
    }

    setIsLoading(true);

    const newConversation = [...conversation, { content: message, role: 'user' }, { content: null, role: 'assistant' }];
    // Add the message to the conversation
    setConversation(newConversation);

    // Clear the message & remove empty chat
    setMessage('');
    setShowEmptyChat(false);

    try {
      const response = await fetch(`/api/server/chat-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversation, { content: message, role: 'user' }],
          model: selectedModel,
        }),
      });

      const conversationId = selectedPrompt?.id ?? generateUUID();

      if (conversation.length === 0) {
        // now store the first conversation in monday storage
        const prompt: Prompt = {
          id: conversationId,
          label: message,
          date: getCurrentDate(),
        };
        await storage().addItemToArray('prompts', prompt);
        setPrompts([...prompts, prompt]);
        setSelectedPrompt(prompt);
      }

      if (response.ok) {
        const data = await response.json();

        const updatedConversation = [
          ...conversation,
          { content: message, role: 'user' },
          { content: data.message, role: 'assistant' },
        ];

        // Update the conversation
        setConversation(updatedConversation);

        await storage().setItem(`prompts-${conversationId}`, JSON.stringify(updatedConversation));
      } else {
        console.error(response);
        setErrorMessage(response.statusText);
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message);

      setIsLoading(false);
    }
  };

  const handleKeypress = async (e: any) => {
    // It triggers by pressing the enter key
    if (e.keyCode == 13 && !e.shiftKey) {
      e.preventDefault();
      await sendMessage(e);
    }
  };

  return (
    <div className="flex max-w-full flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center border-b border-white/20 bg-gray-800 pl-1 pt-1 text-gray-200 sm:pl-3 md:hidden">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:text-white"
          onClick={toggleComponentVisibility}
        >
          <span className="sr-only">Open sidebar</span>
          <RxHamburgerMenu className="h-6 w-6 text-white" />
        </button>
        <h1 className="flex-1 text-center text-base font-normal">New chat</h1>
        <button type="button" className="px-3">
          <BsPlusLg className="h-6 w-6" />
        </button>
      </div>
      <div className="relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1">
        <div className="flex-1 overflow-hidden">
          <div className="react-scroll-to-bottom--css-ikyem-79elbk h-full dark:bg-gray-800">
            <div className="react-scroll-to-bottom--css-ikyem-1n7m0yu">
              {conversation.length > 0 ? (
                <div className="flex flex-col items-center text-sm bg-gray-800">
                  <div className="flex w-full items-center justify-center gap-1 border-b border-black/10 bg-gray-50 p-3 text-gray-500 dark:border-gray-900/50 dark:bg-gray-700 dark:text-gray-300">
                    Model: {selectedModel.name}
                  </div>
                  {conversation.map((message, index) => (
                    <Message key={index} message={message} />
                  ))}
                  <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
                  <div ref={bottomOfChatRef}></div>
                </div>
              ) : null}
              <div className="flex flex-col items-center text-sm dark:bg-gray-800"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t md:border-t-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:bg-vert-light-gradient bg-white dark:bg-gray-800 md:!bg-transparent dark:md:bg-vert-dark-gradient pt-2">
          <form className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
            <div className="relative flex flex-col h-full flex-1 items-stretch md:flex-col">
              {errorMessage ? (
                <div className="mb-2 md:mb-0">
                  <div className="h-full flex ml-1 md:w-full md:m-auto md:mb-2 gap-0 md:gap-2 justify-center">
                    <span className="text-red-500 text-sm">{errorMessage}</span>
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                <textarea
                  ref={textAreaRef}
                  value={message}
                  tabIndex={0}
                  data-id="root"
                  style={{
                    height: '24px',
                    maxHeight: '200px',
                    overflowY: 'hidden',
                  }}
                  // rows={1}
                  placeholder="Send a message..."
                  className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeypress}
                ></textarea>
                <button
                  disabled={isLoading || message?.length === 0}
                  onClick={sendMessage}
                  className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
                >
                  <FiSend className="h-4 w-4 mr-1 text-white " />
                </button>
              </div>
            </div>
          </form>
          <div className="px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
            <span>AI Chatbot may produce inaccurate information about people, places, or facts.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
