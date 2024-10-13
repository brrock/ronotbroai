import { google } from '@ai-sdk/google';
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from './custom-middleware';


export const customModel = wrapLanguageModel({
  model: google("gemini-1.5-flash-latest"),
  middleware: customMiddleware,
});
