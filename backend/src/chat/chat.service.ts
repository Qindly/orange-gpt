import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
  }

  async saveMessage(conversationId: string, role: string, content: string) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    });
  }

  async touchConversation(conversationId: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  }



  /** 流式调用，返回 AsyncIterable */
  async *streamChat(messages: ChatMessage[]) {
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-5.3-codex', // 你可以换成你的中转支持的模型
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}