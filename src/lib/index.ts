// place files you want to import through the `$lib` alias in this folder.
import * as assert from 'node:assert';
import type { ULID, UUID } from 'ulid';
import zod, { util } from 'zod';
import assertEqual = util.assertEqual;

export type SingInData = { username: string, userid: string };
export const SignInSchema = zod.object({
  username: zod.string().min(3).max(20),
  userid: zod.string().uuid(),
});

export type DesensitizedUser = { username: string, tagline: number, }
export const DesensitizedUserSchema = zod.object({
  username: zod.string().min(3).max(20),
  tagline: zod.number(),
});

export type User = DesensitizedUser & { userid: UUID };
export const UserSchema = zod.object({
  ...DesensitizedUserSchema.shape,
  userid: zod.string().uuid(),
});

export type DesensitizedMessage = {
  content: string,
  id: ULID,
  user: DesensitizedUser,
}
export const DesensitizedMessageSchema = zod.object({
  content: zod.string(),
  id: zod.string().ulid(),
  user: DesensitizedUserSchema,
});

export function desensitize(message: DesensitizedMessage): DesensitizedMessage {
  return {
    content: message.content,
    id: message.id,
    user: {
      username: message.user.username,
      tagline: message.user.tagline,
    },
  };
}

export type Message = DesensitizedMessage & { user: User };
export const MessageSchema = zod.object({
  ...DesensitizedMessageSchema.shape,
  user: UserSchema,
});

export type BroadcastMessage = Omit<DesensitizedMessage, 'content'> & {
  timestamp: number,
  processedContent: string,
  self: boolean
};
export const BroadcastMessageSchema = zod.object({
  user: DesensitizedMessageSchema.shape.user,
  id: DesensitizedMessageSchema.shape.id,
  timestamp: zod.number(),
  processedContent: zod.string(),
  self: zod.boolean(),
});

export function desensitizeBroadcast(message: DBMessage, user: User, forUserid: string): BroadcastMessage {
  if (message.userid !== user.userid) {
    throw new Error('userid mismatch');
  }
  return {
    user: {
      username: user.username,
      tagline: user.tagline,
    },
    id: message.id,
    timestamp: message.timestamp,
    processedContent: message.processedContent,
    self: user.userid == forUserid,
  };
}

export function desensitizeBroadcastNoUser(message: DBMessage, user: User): BroadcastMessage {
  if (message.userid !== user.userid) {
    throw new Error('userid mismatch');
  }
  return {
    user: {
      username: user.username,
      tagline: user.tagline,
    },
    id: message.id,
    timestamp: message.timestamp,
    processedContent: message.processedContent,
    self: false,
  };
}

export type DBMessage = Omit<Message, 'user'> & {
  userid: UUID,
  timestamp: number,
  processedContent: string
};
export const DBMessageSchema = zod.object({
  id: MessageSchema.shape.id,
  content: MessageSchema.shape.content,
  userid: zod.string().uuid(),
  timestamp: zod.number(),
  processedContent: zod.string(),
});


export type GETData = { exists: boolean, messages: BroadcastMessage[] };
export const GETSchema = zod.object({
  exists: zod.boolean(),
  messages: zod.array(BroadcastMessageSchema),
});

export type POSTData = { username: string };
export const POSTSchema = zod.object({
  username: zod.string().min(3).max(20),
});

export type POSTResponse = User

export type ImagePOSTResponseData = { success: boolean, url?: string };
export const ImagePOSTResponseSchema = zod.object({
  success: zod.boolean(),
  url: zod.string().optional(),
});