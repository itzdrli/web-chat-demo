import type {
  ClientMessageData,
  DBMessageData,
  LoginData,
  MessageData,
} from '$lib';
import { openKv } from '@deno/kv';

export const kv = await openKv('./server.db');

export const db = {
  async getUser(id: string) {
    return kv.get<LoginData | null>(['user', id]).then(v => v.value);
  },
  async setUser(id: string, user: LoginData) {
    return kv.set(['user', id], user);
  },
  async addMessage(message: DBMessageData) {
    const messages = await kv.get<MessageData[] | null>(['messages']);
    if (messages.value) {
      while (messages.value.length > 100) {
        messages.value.shift();
      }
      await kv.set(['messages'], [...(messages.value), message]);
    } else {
      await kv.set(['messages'], [message]);
    }
  },
  async getMessages() {
    const messages = await kv.get<DBMessageData[] | null>(['messages']);
    if (messages.value) {
      return messages.value;
    } else {
      return [];
    }
  },
};

export function messageAbstention(messages: DBMessageData[], userid: string): ClientMessageData[] {
  return messages.map(v => {
    return {
      self: v.userid == userid,
      username: v.username,
      content: v.content,
      timestamp: v.timestamp,
    };
  });
}