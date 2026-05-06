import { create } from 'zustand';
import { type Conversation, type Message } from '../type/type';

interface ChatState {
    conversations: Conversation[];
    currentId: string | null;
    messages: Message[];
    isLoading: boolean;

    set: {
        conversations: (conversations: Conversation[]) => void;
        currentId: (id: string | null) => void;
        messages: (messages: Message[]) => void;
        isLoading: (loading: boolean) => void;
    };
}

export const useChatStore = create<ChatState>((set) => ({
    conversations: [],
    currentId: null,
    messages: [],
    isLoading: false,

    set: {
        conversations: (conversations) => set({ conversations }),
        currentId: (currentId) => set({ currentId }),
        messages: (messages) => set({ messages }),
        isLoading: (isLoading) => set({ isLoading }),
    },
}));