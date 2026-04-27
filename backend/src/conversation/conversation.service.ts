import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ConversationService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.conversation.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
    }

    create() {
        return this.prisma.conversation.create({
            data: {},
        });
    }

    updateTitle(id: string, title: string) {
        return this.prisma.conversation.update({
            where: { id },
            data: { title },
        });
    }

    remove(id: string) {
        return this.prisma.conversation.delete({
            where: { id },
        });
    }
}