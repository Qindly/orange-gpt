import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { api } from '../services/api';

export const useConversation = () => {
  const { conversations, currentId, set } = useChatStore();

  const fetchConversations = useCallback(async () => {
    const data = await api.fetchConversations();
    set.conversations(data);
  }, []);

  // 创建新对话 —— 必须 return id
  const createConversation = useCallback(async () => {
    const data = await api.createConversation();
    // 新会话放最前面（最新的在上面）
    const current = useChatStore.getState().conversations;
    set.conversations([data, ...current]);
    set.currentId(data.id);
    set.messages([]);
    return data.id; // ← 关键：返回 id 给 useChat 用
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    set.currentId(id);
    set.messages([]);
    const data = await api.fetchConversation(id);
    if (data.messages) {
      set.messages(data.messages);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    await api.deleteConversation(id);
    const current = useChatStore.getState().conversations;
    const currentActiveId = useChatStore.getState().currentId;
    set.conversations(current.filter((c) => c.id !== id));
    if (currentActiveId === id) {
      set.currentId(null);
      set.messages([]);
    }
  }, []);

  const updateTitle = useCallback(async (id: string, title: string) => {
    await api.updateConversationTitle(id, title);
    const current = useChatStore.getState().conversations;
    set.conversations(current.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    currentId,
    createConversation,
    selectConversation,
    deleteConversation,
    updateTitle,
    reload: fetchConversations,
  };
};