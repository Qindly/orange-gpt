import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ConversationService } from './conversation.service';
@Controller('api/conversations')
export class ConversationController {
    constructor(private conversationService: ConversationService) { }

    @Get()
    findAll() {
        return this.conversationService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.conversationService.findOne(id);
    }

    @Post()
    create() {
        return this.conversationService.create();
    }

    @Patch(':id')
    updateTitle(@Param('id') id: string, @Body('title') title: string) {
        return this.conversationService.updateTitle(id, title);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.conversationService.remove(id);
    }
}