// place files you want to import through the `$lib` alias in this folder.
import zod from 'zod';

export interface MessageData {
  content: string;
  timestamp: number;
}

export type ClientMessageData =
  MessageData
  & { username: string, self: boolean };

export type DBMessageData = MessageData & { username: string, userid: string };

export interface LoginData {
  username: string;
  userid: string;
}

export const LoginSchema = zod.object({
  username: zod.string().min(3),
  userid: zod.string(),
});

export const GETSchema = zod.object({
  user: LoginSchema,
  messages: zod.array(zod.object({
    username: zod.string(),
    content: zod.string(),
    timestamp: zod.number(),
    self: zod.boolean(),
  }))
})


export const POSTSchema = zod.object({
  username: zod.string().min(3),
})
