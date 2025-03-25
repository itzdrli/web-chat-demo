import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extname } from 'node:path';
import * as fs from 'node:fs';
import Logger from '$lib/server/logger';

const logger = Logger('image');

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const uploadedFile = formData?.get('image');
  if (uploadedFile && uploadedFile instanceof File) {
    const filename = `${ crypto.randomUUID() }${ extname(uploadedFile.name) }`;
    await saveFile(uploadedFile, filename);
    logger.info(`Image uploaded: ${ filename }`);
    return json({
      success: true,
      url: `/image/${ filename }.webp`,
    });
  }
  return json({
    success: false,
  });
};

async function saveFile(file: File, name: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.access('./images', fs.constants.F_OK, async (err) => {
      if (err) {
        fs.mkdir('./images', (err) => {
          if (err) {
            reject(err);
          }
          resolve(saveFile(file, name))
        });
        resolve(false);
      }
      fs.writeFile(`./images/${ name }`, Buffer.from(await file.arrayBuffer()), (err) => {
        if (err) {
          reject(err);
        }
        resolve(true);
      });
    });
  });
}