import React, { useContext, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai';
import { FiMessageSquare } from 'react-icons/fi';
import { context } from '../helpers/context';
import { shortenString } from '../helpers/string';
import { storage } from '../helpers/storage/client';

const Sidebar = () => {
  let data = useContext(context) as unknown as string[];
  const clearConversations = async () => {
    await storage().removeItem('prompts');
    data = [];
  };

  return (
    <div className="scrollbar-trigger flex h-full w-full flex-1 items-start border-white/20">
      <nav className="flex h-full flex-1 flex-col space-y-1 p-2">
        <a className="flex py-3 px-3 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm mb-1 flex-shrink-0 border border-white/20">
          <AiOutlinePlus className="h-4 w-4" />
          New chat
        </a>
        <div className="flex-col flex-1 overflow-y-auto border-b border-white/20">
          {data && data.length
            ? data.map((prompt: any, index: number) => (
                <div className="flex flex-col gap-2 pb-2 text-gray-100 text-sm" key={`prompt-${index}`}>
                  <a className="flex py-3 px-3 items-center gap-3 relative rounded-md hover:bg-[#2A2B32] cursor-pointer break-all hover:pr-4 group">
                    <FiMessageSquare className="h-4 w-4" />
                    <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative">
                      {shortenString(prompt, 25)}
                      <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-gray-900 group-hover:from-[#2A2B32]"></div>
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
