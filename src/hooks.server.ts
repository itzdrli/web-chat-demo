import Logger from '$lib/server/logger';
import type { HandleServerError } from '@sveltejs/kit';

let logger = Logger('hook');

export const handleError: HandleServerError = ({ error }) => {
  logger.error(error);
};