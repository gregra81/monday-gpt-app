import { createContext } from 'react';
export const PromptsContext = createContext({ prompts: [], setPrompts: (prompts: string[]) => {} });
