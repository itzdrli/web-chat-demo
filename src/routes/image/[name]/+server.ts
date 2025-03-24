import * as fs from 'node:fs';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`./images/${ params.name }`, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(new Response(data, {
        headers: {
          'Content-Type': 'image/*',
        },
      }));
    });
  });
};