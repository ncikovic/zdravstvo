import { parse as parseUuid, stringify as stringifyUuid } from 'uuid';

export const uuidToBuffer = (value: string): Buffer => {
  return Buffer.from(parseUuid(value));
};

export const bufferToUuid = (value: Buffer): string => {
  return stringifyUuid(value);
};
