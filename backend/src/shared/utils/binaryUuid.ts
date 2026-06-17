import { Buffer } from 'node:buffer';

const UUID_SEGMENT_LENGTHS = [8, 4, 4, 4, 12] as const;

const stripUuidDashes = (value: string): string => value.replaceAll('-', '').toLowerCase();

export const uuidToBuffer = (value: string): Buffer =>
  Buffer.from(stripUuidDashes(value), 'hex');

export const bufferToUuid = (value: Buffer | Uint8Array | string): string => {
  const hex = typeof value === 'string' ? stripUuidDashes(value) : Buffer.from(value).toString('hex');
  let offset = 0;

  return UUID_SEGMENT_LENGTHS.map((segmentLength) => {
    const segment = hex.slice(offset, offset + segmentLength);
    offset += segmentLength;
    return segment;
  }).join('-');
};
