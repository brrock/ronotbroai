import type { Prisma } from '@prisma/client';

export type User = {
  id: string;
  email: string;
  password?: string | null;
};

export type Chat = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string;
  visibility: string;
};

export type Message = {
  id: string;
  chatId: string;
  role: string;
  content: any;
  createdAt: Date;
};

export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
};

export type Document = {
  id: string;
  createdAt: Date;
  title: string;
  content?: string | null;
  kind: string;
  userId: string;
};

export type Suggestion = {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description?: string | null;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
};

// Prisma input types
export type MessageCreateInput = Prisma.MessageCreateInput;
export type ChatCreateInput = Prisma.ChatCreateInput;
export type DocumentCreateInput = Prisma.DocumentCreateInput;
export type SuggestionCreateInput = Prisma.SuggestionCreateInput;
export type VoteCreateInput = Prisma.VoteCreateInput; 