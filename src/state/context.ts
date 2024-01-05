import { createContext } from 'react';
import { Conversation, Prompt } from '../types/chat';
import type { BaseContext } from 'monday-sdk-js/types/client-context.type';
export const PromptsContext = createContext({ prompts: [] as Prompt[], setPrompts: (prompts: Prompt[]) => {} });
export const PromptsContextSelected = createContext({
  selectedPrompt: null as Prompt | null,
  setSelectedPrompt: (prompt: Prompt | null) => {},
});
export const ConversationContext = createContext({
  conversation: [] as Conversation[],
  setConversation: (messages: Conversation[]) => {},
});

export const MondayContext = createContext({
  context: {} as BaseContext,
});
