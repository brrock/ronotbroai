import 'server-only';
import { genSaltSync, hashSync } from 'bcrypt-ts';
import prisma from '../prisma';
import type { Message, Suggestion, Prisma, User } from '@prisma/client';
import type { BlockKind } from '@/components/block';
import { handleDatabaseError } from './error';

export async function getUser(email: string): Promise<User[]> {
  console.log(`[DB] Getting user by email: ${email}`);
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(`[DB] User found: ${user?.id ?? 'not found'}`);
    return user ? [user] : [];
  } catch (error) {
    throw handleDatabaseError('getUser', error);
  }
}

export async function createUser(email: string, password: string) {
  console.log(`[DB] Creating user with email: ${email}`);
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const user = await prisma.user.create({
      data: { email, password: hash },
    });
    console.log(`[DB] User created: ${user.id}`);
    return user;
  } catch (error) {
    throw handleDatabaseError('createUser', error);
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  console.log(`[DB] Creating chat: ${id} for user: ${userId}`);
  try {
    const chat = await prisma.chat.create({
      data: {
        id,
        createdAt: new Date(),
        userId,
        title,
      },
    });
    console.log(`[DB] Chat created: ${chat.id}`);
    return chat;
  } catch (error) {
    throw handleDatabaseError('saveChat', error);
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    // Prisma will handle cascading deletes due to onDelete: Cascade in schema
    return await prisma.chat.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await prisma.chat.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Omit<Message, 'id'>> }) {
  console.log(`[DB] Creating ${messages.length} messages`);
  try {
    const result = await prisma.message.createMany({
      data: messages as Array<Prisma.MessageCreateManyInput>,
    });
    console.log(`[DB] Created ${result.count} messages`);
    return result;
  } catch (error) {
    throw handleDatabaseError('saveMessages', error);
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await prisma.message.findMany({
      where: { chatId: id },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  console.log(`[DB] ${type}voting message: ${messageId} in chat: ${chatId}`);
  try {
    const vote = await prisma.vote.upsert({
      where: {
        chatId_messageId: {
          chatId,
          messageId,
        },
      },
      create: {
        chatId,
        messageId,
        isUpvoted: type === 'up',
      },
      update: {
        isUpvoted: type === 'up',
      },
    });
    console.log(`[DB] Vote ${vote.isUpvoted ? 'up' : 'down'} recorded`);
    return vote;
  } catch (error) {
    throw handleDatabaseError('voteMessage', error);
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await prisma.vote.findMany({
      where: { chatId: id },
    });
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}) {
  try {
    return await prisma.document.create({
      data: {
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    return await prisma.document.findMany({
      where: { id },
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    return await prisma.document.findFirst({
      where: { id },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await prisma.suggestion.deleteMany({
      where: {
        documentId: id,
        documentCreatedAt: { gt: timestamp },
      },
    });

    return await prisma.document.deleteMany({
      where: {
        id,
        createdAt: { gt: timestamp },
      },
    });
  } catch (error) {
    console.error('Failed to delete documents by id after timestamp from database');
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Omit<Suggestion, 'id'>>;
}) {
  try {
    return await prisma.suggestion.createMany({
      data: suggestions as Array<Prisma.SuggestionCreateManyInput>,
    });
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await prisma.suggestion.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to get suggestions by document id from database');
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await prisma.message.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    // First delete related votes
    await prisma.vote.deleteMany({
      where: {
        chatId,
        message: {
          createdAt: { gt: timestamp },
        },
      },
    });

    // Then delete messages
    return await prisma.message.deleteMany({
      where: {
        chatId,
        createdAt: { gt: timestamp },
      },
    });
  } catch (error) {
    console.error('Failed to delete messages by chat id after timestamp from database');
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await prisma.chat.update({
      where: { id: chatId },
      data: { visibility },
    });
  } catch (error) {
    console.error('Failed to update chat visibility by id in database');
    throw error;
  }
} 