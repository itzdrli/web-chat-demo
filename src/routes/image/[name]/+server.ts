import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const name = params.name;
  return await findImg(name);
};

async function findImg(name: string): Promise<Response> {
  const rawName = path.parse(name).name;
  try {
    await fs.access('./images/compressed', fs.constants.F_OK);
  } catch (e) {
    await fs.mkdir('./images/compressed', { recursive: true });
  }
  let file;
  try {
    await fs.access(`./images/compressed/${ name }`);
    file = await fs.readFile(`./images/compressed/${ name }`);
  } catch (e) {
    try {
      await fs.access(`./images/${ rawName }`);
      file = await sharp(await fs.readFile(`./images/${ rawName }`)).webp().resize(400).toBuffer();
      await fs.writeFile(`./images/compressed/${ name }`, file);
    } catch (e) {
      return new Response(null, {
        status: 404,
      });
    }
  }
  return new Response(file, {
    headers: {
      'Content-Type': 'image/webp',
    },
  });
}