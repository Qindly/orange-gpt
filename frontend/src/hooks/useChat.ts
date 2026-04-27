import { useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';



export const useChat = () => {
  const store = useChatStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
  * 发送消息
  * @param content - 用户输入的文本
  * @param ensureConversationId - 外部传入的创建会话函数，
  *   当没有当前会话时调用它来新建一个，返回新会话的 id
  */
  const sendMessage = useCallback(async (content: string, ensureConversationId: () => Promise<string>) => {
    //1. 先做检查
    if (!content.trim() || store.isLoading) return;
    let conversationId = useChatStore.getState().currentId;
    if (!conversationId) {
      conversationId = await ensureConversationId();
    }


    //2. 添加用户消息
    const userMessage = {
      id: crypto.randomUUID(),
    role: 'user' as const,
      content,
      createdAt: new Date().toISOString(),
    };

//3. 预创建一个空的 assistant 消息，后面逐字填充
const assistantMessage = {
  id: crypto.randomUUID(),
  role: 'assistant' as const,
  content: '',
  createdAt: new Date().toISOString(),
};

//4. 获取之前的消息列表（如果有对话 ID 就用 store 的，否则用本地 state）
const preMessages = useChatStore.getState().currentId === conversationId ? useChatStore.getState().messages : [];//getState是什么意思，我们没有创建这个数吧？
//5. 更新消息列表，先把用户消息和空的助手消息加上去，这样界面上就能立刻看到用户的输入和助手的回复框了
//这样不会重复渲染，而且每个字都渲染，性能怎么解决啊？
store.set.messages([...preMessages, userMessage, assistantMessage]);
store.set.isLoading(true);

//5. 构造发给后端的消息数组,所有消息都放在一起，后端根据 role 区分用户和助手消息
// 为什么不能 const apiMessages = [...preMessages, userMessage];
// 而是要 map 一下？因为 preMessages 可能来自 store，如果直接展开可能会导致后续修改 preMessages 时影响到 store 中的消息，造成不可预期的副作用。通过 map 创建一个新的数组，确保我们操作的是一个独立的副本，不会影响到 store 中的原始数据。
// 另外，map 的时候我们只取了 role 和 content 字段，丢弃了 id 和 createdAt，这样可以避免把一些不必要的信息发送给后端，同时也让请求体更简洁。
const apiMessages = [...preMessages, userMessage].map(({ role, content }) => ({ role, content }));

try {
  abortControllerRef.current = new AbortController();

  //  发送请求
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, messages: apiMessages }),
    signal: abortControllerRef.current.signal,//这个是什么意思
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  // 4. 读取 SSE 流
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No reader');

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? ''; // 最后一部分可能不完整，保留在 buffer 中
    for (const part of parts) {
      const lines = part.split('\n').filter((line) => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        // 去掉 "data: "
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            // 5. 将新内容追加到 assistant 消息中
            assistantMessage.content += parsed.content;
            // 6. 更新消息列表（替换最后一条）
            const currentMessages = useChatStore.getState().messages;
            store.set.messages(
              currentMessages.map((msg) => (msg.id === assistantMessage.id ? assistantMessage : msg))
            );
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }
  }
} catch (error) {
  if ((error as Error).name === 'AbortError') {
    console.log('请求已取消');
  } else {
    console.error('请求失败:', error);
    // 错误时更新 assistant 消息内容
    const currentMessages = useChatStore.getState().messages;
    store.set.messages(
      currentMessages.map((msg) =>
        msg.id === assistantMessage.id
          ? { ...msg, content: '请求失败，请稍后再试。' }
          : msg
      )
    );
  }
} finally {
  store.set.isLoading(false);
  abortControllerRef.current = null;
}
  }, []);

// 停止生成
const stopGenerating = useCallback(() => {
  abortControllerRef.current?.abort();
  store.set.isLoading(false);
}, []);

return { sendMessage, stopGenerating };
};