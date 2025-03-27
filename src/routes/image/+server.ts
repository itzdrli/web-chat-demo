import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extname } from 'node:path';
import * as fs from 'node:fs';
import Logger from '$lib/server/logger';
import * as dotenv from 'dotenv';

dotenv.config();
const logger = Logger('image');
interface Env {
  CENSOR_USER: string;
  CENSOR_SECRET: string;
}

const env = {
  CENSOR_USER: process.env.CENSOR_USER || '',
  CENSOR_SECRET: process.env.CENSOR_SECRET || '',
}

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const uploadedFile = formData?.get('image');
  if (uploadedFile && uploadedFile instanceof File) {
    const filename = `${ crypto.randomUUID() }${ extname(uploadedFile.name) }`;
    await saveFile(uploadedFile, filename);
    
    try {
      const censorData = new URLSearchParams();
      censorData.append('url', `https://chat.itzdrli.cc/image/${filename}`);
      censorData.append('models', 'nudity-2.1');
      censorData.append('api_user', env.CENSOR_USER);
      censorData.append('api_secret', env.CENSOR_SECRET);
      
      const censorUrl = `https://api.sightengine.com/1.0/check.json?${ censorData.toString() }`;

      const resp = await fetch(censorUrl, {
        method: 'GET'
      });

      if (!resp.ok) {
        logger.error(`Censor API error: ${resp.status} ${resp.statusText}`);
        return json({
          success: false,
        });
      }
      const respData = await resp.json();
      logger.info(`Image uploaded: ${filename}`);
      if (respData?.nudity?.sexual_display < 0.8) {
        logger.info(`Image passed: ${filename}`);
        return json({
          success: true,
          url: `/image/${filename}.webp`,
        });
      }
    } catch (e) {
      logger.error(`Censor API error: ${e}`);
      return json({
        success: false,
      });
    }
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