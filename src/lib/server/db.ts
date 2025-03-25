import {
  type BroadcastMessage,
  type DBMessage, desensitizeBroadcast, desensitizeBroadcastNoUser,
  type SingInData,
  type User,
} from '$lib';
import { openKv } from '@deno/kv';
import Logger from '$lib/server/logger';

const logger = Logger('db');

export const kv = await openKv('./server.db');

export const db = {
  async getUser(id: string) {
    return kv.get<User | null>(['users', id]).then(v => v.value);
  },
  async getUsersByName(name: string): Promise<User[]> {
    const iter = kv.list<User>({ prefix: ['users_by_name', name] });
    const users: User[] = [];
    for await (const v of iter) {
      users.push(v.value);
    }
    return users;
  },
  async userExists(id: string): Promise<boolean> {
    return kv.get<User | null>(['users', id]).then(v => !!v.value);
  },
  async singInUser(user: SingInData): Promise<User> {
    const count = (await db.getUsersByName(user.username)).length;
    const userData: User = {
      ...user,
      tagline: count,
    };
    const primaryKey = ['users', userData.userid];
    const byNameKey = ['users_by_name', userData.username, userData.tagline, userData.userid];
    await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, userData).set(byNameKey, userData)
    .commit();
    return userData;
  },
  async addMessage(message: DBMessage) {
    const user = await db.getUser(message.userid);
    if (!user) {
      logger.error(`User ${ message.userid } not found`);
      return;
    }
    const primaryKey = ['messages', message.id];
    const byUserIdKey = ['messages_by_userid', user.userid, message.id];
    const byUserNameKey = ['messages_by_username', user.username, user.tagline, message.id];
    await kv.atomic()
    .check({ key: primaryKey, versionstamp: null })
    .set(primaryKey, message)
    .set(byUserIdKey, message)
    .set(byUserNameKey, message)
    .commit();
  },
  async getMessages(count = 100): Promise<DBMessage[]> {
    const iter = kv.list<DBMessage>({ prefix: ['messages'] }, {
      reverse: true,
      limit: count,
    });
    const messages: DBMessage[] = [];
    for await (const v of iter) {
      messages.push(v.value);
    }
    return messages;
  },
  async getMessagesForBroadcast(forUser: string, count = 100): Promise<BroadcastMessage[]> {
    const iter = kv.list<DBMessage>({ prefix: ['messages'] }, {
      reverse: true,
      limit: count,
    });
    const messages: Promise<BroadcastMessage>[] = [];
    for await (const v of iter) {
      messages.push(toBroadcast(v.value, forUser));
    }
    return Promise.all(messages.reverse());
  },
};

export async function toBroadcast(message: DBMessage, forUserid: string): Promise<BroadcastMessage> {
  let user = await db.getUser(message.userid);
  if (!user) {
    logger.error(`User ${ message.userid } not found`);
    user = {
      userid: 'placeholder',
      username: 'Unknown',
      tagline: 0,
    };
  }
  return desensitizeBroadcast(message, user, forUserid);
}


export async function toBroadcastNoUser(message: DBMessage): Promise<BroadcastMessage> {
  let user = await db.getUser(message.userid);
  if (!user) {
    logger.error(`User ${ message.userid } not found`);
    user = {
      userid: 'placeholder',
      username: 'Unknown',
      tagline: 0,
    };
  }
  return desensitizeBroadcastNoUser(message, user);
}

export async function toBroadcastArray(messages: DBMessage[], userid: string): Promise<BroadcastMessage[]> {
  return Promise.all(messages.map(message => toBroadcast(message, userid)));
}