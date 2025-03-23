import { type ClientMessageData, LoginSchema, POSTSchema } from '$lib';
import { db, messageAbstention } from '$lib/server/db';
import {
  json,
  type Socket,
} from '@sveltejs/kit';
import Cookie from 'cookie';
import {
  CommonWsServerListener, type MessageEventClient,
  server,
} from '$lib/ws';
import type {
  RequestHandler,
} from './$types';

const wsListener: CommonWsServerListener = new CommonWsServerListener();

wsListener.register('heartbeat', async (e, p) => {
  if (e.data.heartbeat == 'ping') {
    server.emit(p, 'heartbeat', { heartbeat: 'pong' });
  }
});

wsListener.register('server-message', async (e, p) => {
  const cookie = p.request.headers.get('cookie');
  if (cookie) {
    const cookies = Cookie.parse(cookie);
    if (cookies['chat-token']) {
      const token = cookies['chat-token'];
      const user = await db.getUser(token);
      if (user) {
        console.log(user.username, e.data.content);
        await db.addMessage({
          username: user.username,
          content: e.data.content,
          timestamp: e.data.timestamp,
          userid: user.userid,
        });
        const message: MessageEventClient = {
          type: 'client-message',
          data: {
            username: user.username,
            content: e.data.content,
            timestamp: e.data.timestamp,
            self: false,
          },
        };
        p.publish('chat', JSON.stringify(message));
        message.data.self = true;
        p.send(JSON.stringify(message));
      }
    }
  }
});

export const socket: Socket = {
  open(peer) {
    peer.subscribe('chat');
  },

  async message(peer, message) {
    await wsListener.resolve(peer, message);
  },

  close(peer, event) {
    peer.unsubscribe('chat');
  },

  error(peer, error) {
  },
};

export const POST: RequestHandler = async ({ cookies, request }) => {
  const data = POSTSchema.parse(await request.json());
  let token = cookies.get('chat-token');
  if (!token) {
    throw new Error('No token');
  }
  await db.setUser(token, { ...data, userid: token });
  return json(data);
};

export const GET: RequestHandler = async ({ cookies }) => {
  let token = cookies.get('chat-token');
  if (!token) {
    token = crypto.randomUUID();
    cookies.set('chat-token', token, {
      path: '/',
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: false,
    });
  }
  const user = await db.getUser(token);
  const messages = messageAbstention(await db.getMessages(), token);
  return json({ user: user, messages });
};
