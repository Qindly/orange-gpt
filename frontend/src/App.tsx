import { useState, useRef, useEffect } from 'react';
import { useChat } from './hooks/useChat';
import { useConversation } from './hooks/useConversation';
import Sidebar from './components/Sidebar/index';
import { useChatStore } from './stores/chatStore';
import { Markdown } from './components/Markdown/index';
import './App.scss';

const App = () => {
  const { sendMessage, stopGenerating } = useChat();
  const { createConversation } = useConversation();
  // 从 store 直接读，避免通过 hook 多一层
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, createConversation);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="chat-app">
        <header className="chat-header">
          <h1>🍊 Orange ChatGPT3</h1>
        </header>

        <main className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">发送一条消息开始对话</div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message message--${msg.role}`}>
              <div className="message__avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message__content">
                <Markdown>
                  {msg.content || (isLoading ? '思考中...' : '')}
                </Markdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="chat-input">
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              rows={1}
              disabled={isLoading}
            />
            {isLoading ? (
              <button type="button" onClick={stopGenerating} className="btn-stop">
                ■ 停止
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()}>
                发送
              </button>
            )}
          </form>
        </footer>
      </div>
    </div>
  );
};

export default App;