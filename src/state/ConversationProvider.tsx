import React, { useState } from 'react';
import { ConversationContext, PromptsContextSelected, PromptsContext } from './context';
import { Conversation, Prompt } from '../types/chat';

export const ConversationProvider = ({ children, props }) => {
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  return (
    <PromptsContext.Provider value={{ setPrompts: props.setPrompts, prompts: props.prompts }}>
      <ConversationContext.Provider value={{ conversation, setConversation }}>
        <PromptsContextSelected.Provider value={{ selectedPrompt, setSelectedPrompt }}>
          {children}
        </PromptsContextSelected.Provider>
      </ConversationContext.Provider>
    </PromptsContext.Provider>
  );
};
