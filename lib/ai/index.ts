import { google } from '@ai-sdk/google';
import { wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: google(apiIdentifier),
    middleware: customMiddleware,
  });
};
