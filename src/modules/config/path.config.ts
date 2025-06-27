import { platform, homedir } from 'os';
import { join } from 'path';

export const getDataBasePath = (): string => {
  const os = platform();

  if (os === 'win32') {
    return 'C:/data';
  } else if (os === 'darwin') {
    return join(homedir(), 'data');
  } else {
    // default: linux/ubuntu
    return '/data';
  }
};
