import { logUnhandledError } from './log-style.util';

export const handleExit = (error: unknown, process: NodeJS.Process): void => {
  if (error && (error as any).name === 'ExitPromptError') process.exit(0);
  logUnhandledError(error);
  process.exit(1);
};
