import React, { useContext, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai';
import { FiMessageSquare } from 'react-icons/fi';
import { PromptsContext, ConversationContext, PromptsContextSelected } from '../state/context';
import { shortenString } from '../helpers/string';
import { storage } from '../helpers/storage/client';
import { Conversation, Prompt } from '../types/chat';

const Sidebar = () => {
  const { prompts, setPrompts } = useContext(PromptsContext);
  const { setConversation } = useContext(ConversationContext);
  const { selectedPrompt, setSelectedPrompt } = useContext(PromptsContextSelected);
  const clearConversations = async () => {
    const prompts = await storage().getItemAsArray<Prompt>('prompts');
    const deletePromptsPromises = prompts.map((prompt: Prompt) => storage().removeItem(`prompts-${prompt.id}`));
    await Promise.all(deletePromptsPromises);

    await storage().removeItem('prompts');
    setPrompts([]);
  };

  const startNewChat = () => {
    setConversation([]);
    setSelectedPrompt(null);
  };

  const loadConversation = async (prompt: Prompt) => {
    const conversation = await storage().getItemAsArray<Conversation>(`prompts-${prompt.id}`);
    setConversation(conversation);
    setSelectedPrompt(prompt);
  };

  return (
    <div className="scrollbar-trigger flex h-full w-full flex-1 items-start border-white/20">
      <nav className="flex h-full flex-1 flex-col space-y-1 p-2">
        <a
          onClick={startNewChat}
          className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20"
        >
          <AiOutlinePlus className="h-4 w-4" />
          New chat
        </a>
        <div className="flex-col flex-1 overflow-y-auto border-b border-white/20">
          {prompts && prompts.length
            ? prompts.map((prompt: Prompt) => (
                <div
                  className={
                    'flex flex-col gap-2 pb-2 text-gray-100 text-sm' +
                    (prompt.id === selectedPrompt?.id ? ' nav-active' : '')
                  }
                  key={`prompt-${prompt.id}`}
                >
                  <a
                    onClick={() => loadConversation(prompt)}
                    className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all hover:pr-4 group"
                  >
                    <FiMessageSquare className="h-4 w-4" />
                    <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                      {shortenString(prompt.label, 25)}
                    </div>
                  </a>
                </div>
              ))
            : null}
        </div>
        <a
          className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm"
          onClick={clearConversations}
        >
          <AiOutlineMessage className="h-4 w-4" />
          Clear conversations
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
