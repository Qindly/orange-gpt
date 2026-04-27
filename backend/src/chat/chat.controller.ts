import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';

interface ChatRequestBody {
  conversationId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

@Controller('api/chat')
export class ChatController {
  constructor(private chatService: ChatService) { }

  @Post()
  async chat(@Body() body: ChatRequestBody, @Res() res: Response) {
    const { conversationId, messages } = body;
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // 把用户消息保存到数据库
      const lastMessage = messages[messages.length - 1];
      if (!messages || messages.length === 0) {
        res.write(`data: ${JSON.stringify({ error: '消息列表不能为空' })}\n\n`);
        return res.end();
      }
      await this.chatService.saveMessage(conversationId, lastMessage.role, lastMessage.content);

      // 收集回复数据，进行存储
      let assistantReply = '';
      for await (const chunk of this.chatService.streamChat(body.messages)) {
        assistantReply += chunk;
        // SSE 格式：data: xxx\n\n
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      await this.chatService.saveMessage(conversationId, 'assistant', assistantReply);
      await this.chatService.touchConversation(conversationId);

      // 发送结束标记
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: '请求失败' })}\n\n`);
      res.end();
    }
  }
}