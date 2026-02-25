import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, message, history } = body;

    if (!characterId || !message) {
      return NextResponse.json({ error: 'Missing characterId or message' }, { status: 400 });
    }

    // Buscar o personagem
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        characterId
      }
    });

    // Criar o sistema prompt com a personalidade do personagem
    const systemPrompt = `Você é ${character.name}. ${character.description}

Sua personalidade: ${character.personality}

REGRAS IMPORTANTES:
- NUNCA quebre o personagem. Você É ${character.name}.
- Responda de forma imersiva e na primeira pessoa.
- Use a personalidade definida acima.
- Seja criativo e envolvente.
- Você pode usar ações entre asteriscos como *sorri* ou *olha nos seus olhos*.
- Mantenha o contexto da conversa.
- Não mencione que é uma IA ou assistente.
- Responda como o personagem responderia.`;

    // Preprar as mensagens para a API
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Adicionar histórico se existir
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) { // Últimas 10 mensagens para contexto
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // Adicionar mensagem atual
    messages.push({ role: 'user', content: message });

    // Chamar a API de IA
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    const responseContent = completion.choices[0]?.message?.content || 'Desculpe, não consegui responder.';

    // Salvar resposta do assistente
    await prisma.message.create({
      data: {
        content: responseContent,
        role: 'assistant',
        characterId
      }
    });

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Buscar histórico de mensagens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json({ error: 'Missing characterId' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { characterId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
