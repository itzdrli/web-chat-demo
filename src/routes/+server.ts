import { POSTSchema } from '$lib';
import { db, messageAbstention } from '$lib/server/db';
import {
  json, type Peer,
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
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';
import Logger from '$lib/server/logger';

const logger = Logger('chat');

const md = new MarkdownIt();
md.use(
  await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  }),
);

const wsListener: CommonWsServerListener = new CommonWsServerListener();

wsListener.register('heartbeat', async (e, p) => {
  if (e.data.heartbeat == 'ping') {
    server.emit(p, 'heartbeat', { heartbeat: 'pong' });
  }
});

wsListener.register('server-message', async (e, p) => {
  const user = await getUser(p);
  if (!user) {
    throw new Error('No user');
  }
  const rendered = md.render(e.data.content);
  if (user) {
    await db.addMessage({
      username: user.username,
      content: rendered,
      timestamp: e.data.timestamp,
      userid: user.userid,
      rawContent: e.data.content,
    });
    const message: MessageEventClient = {
      type: 'client-message',
      data: {
        username: user.username,
        content: rendered,
        timestamp: e.data.timestamp,
        self: false,
      },
    };
    p.publish('chat', JSON.stringify(message));
    message.data.self = true;
    p.send(JSON.stringify(message));
  }
});

async function getUser(peer: Peer) {
  const cookie = peer.request.headers.get('cookie');
  if (cookie) {
    const cookies = Cookie.parse(cookie);
    if (cookies['chat-token']) {
      const token = cookies['chat-token'];
      const user = await db.getUser(token);
      return user ?? undefined;
    }
  }
}

export const socket: Socket = {
  async open(peer) {
    peer.subscribe('chat');
    const user = await getUser(peer);
    if (user) {
      logger.info(`User ${ user.username } joined`);
    }
  },

  async message(peer, message) {
    await wsListener.resolve(peer, message);
  },

  async close(peer, event) {
    peer.unsubscribe('chat');
    const user = await getUser(peer);
    if (user) {
      logger.info(`User ${ user.username } left`);
    }
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
