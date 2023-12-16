import React, { useState } from 'react';
import { ConversationContext, PromptsContextSelected } from './context';
import { Conversation, Prompt } from '../types/chat';

export const ConversationProvider = ({ children }) => {
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  return (
    <ConversationContext.Provider value={{ conversation, setConversation }}>
      <PromptsContextSelected.Provider value={{ selectedPrompt, setSelectedPrompt }}>
        {children}
      </PromptsContextSelected.Provider>
    </ConversationContext.Provider>
  );
};
