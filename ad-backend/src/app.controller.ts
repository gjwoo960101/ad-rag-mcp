import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/chat')
  async handleChat(@Body() body: { message: string }): Promise<any> {
    const userInput = body.message;
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_current_time',
          description: '현재 시간을 ISO 형식으로 반환합니다.',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_hello',
          description: '인사말을 반환합니다.',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
    ];

    const llmResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: userInput }],
        tools,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('OPENAI_API_KEY')}`,
        },
      },
    );

    console.log('=== OpenAI 응답 정보 ===');
    console.log('전체 응답:', JSON.stringify(llmResponse.data, null, 2));

    const toolCalls = llmResponse.data.choices[0]?.message?.tool_calls;
    if (!toolCalls || toolCalls.length === 0) {
      return { assistant: llmResponse.data.choices[0].message.content };
    }

    const toolCall = toolCalls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    const mcpResponse = await axios.post(
      'http://host.docker.internal:3001/call',
      {
        name: toolName,
        arguments: toolArgs,
      },
    );

    const toolResult = mcpResponse.data;

    const finalResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: userInput },
          llmResponse.data.choices[0].message,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('OPENAI_API_KEY')}`,
        },
      },
    );

    return {
      assistant: finalResponse.data.choices[0].message.content,
    };
  }
}
