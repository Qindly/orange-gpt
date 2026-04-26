//写用于请求相关的函数。
const BASE = '/api';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
}

export const api = {
    //获取对话列表
    async fetchConversations(): Promise<Conversation[]> {
        const response = await fetch(`${BASE}/conversations`);
        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }
        return response.json();
    },

    //获取单个对话详情
    async fetchConversation(conversationId: string): Promise<Conversation> {
        const response = await fetch(`${BASE}/conversations/${conversationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch conversation');
        }
        return response.json();
    },

    //创建新对话
    async createConversation(): Promise<Conversation> {
        const response = await fetch(`${BASE}/conversations`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }
        return response.json();
    },

    //更新对话标题
    async updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
        const response = await fetch(`${BASE}/conversations/${conversationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }),
        });
        if (!response.ok) {
            throw new Error('Failed to update conversation title');
        }
        return response.json();
    },

    //删除对话
    async deleteConversation(conversationId: string): Promise<void> {
        const response = await fetch(`${BASE}/conversations/${conversationId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete conversation');
        }
    },


    // //发送消息并获取流式响应
    // async sendMessage(conversationId: string, content: string, onMessage: (message: Message) => void, signal: AbortSignal): Promise<void> {
    //     const response = await fetch(`${BASE}/chat`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             conversationId,
    //             content,
    //         }),
    //     });
    // }

}