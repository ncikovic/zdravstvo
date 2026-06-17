import type {
  AccessibilitySettingsDto,
  UpdateAccessibilitySettingsRequestDto,
} from "@zdravstvo/contracts";
import type { Buffer } from "node:buffer";

import { db } from "../shared/db/index.js";
import { bufferToUuid, uuidToBuffer } from "../shared/utils/index.js";

interface AccessibilitySettingsRow {
  user_id: Buffer | Uint8Array | string;
  font_scale: number | string;
  high_contrast: boolean | number;
  simple_mode: boolean | number;
  voice_confirmations: boolean | number;
  created_at: Date | string;
  updated_at: Date | string;
}

const TABLE_NAME = "user_accessibility_settings";

const toIso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const toDto = (row: AccessibilitySettingsRow): AccessibilitySettingsDto => ({
  userId: bufferToUuid(row.user_id),
  fontScale: Number(row.font_scale),
  highContrast: Boolean(row.high_contrast),
  simpleMode: Boolean(row.simple_mode),
  voiceConfirmations: Boolean(row.voice_confirmations),
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const defaultDto = (userId: string): AccessibilitySettingsDto => ({
  userId,
  fontScale: 1,
  highContrast: false,
  simpleMode: false,
  voiceConfirmations: false,
  createdAt: null,
  updatedAt: null,
});

const toPersistencePayload = (
  payload: UpdateAccessibilitySettingsRequestDto,
): Record<string, unknown> => {
  const update: Record<string, unknown> = {};

  if ("fontScale" in payload) {
    update.font_scale = payload.fontScale;
  }

  if ("highContrast" in payload) {
    update.high_contrast = payload.highContrast ? 1 : 0;
  }

  if ("simpleMode" in payload) {
    update.simple_mode = payload.simpleMode ? 1 : 0;
  }

  if ("voiceConfirmations" in payload) {
    update.voice_confirmations = payload.voiceConfirmations ? 1 : 0;
  }

  return update;
};

export const accessibilityRepository = {
  async findByUserId(userId: string): Promise<AccessibilitySettingsDto> {
    const row = await db<AccessibilitySettingsRow>(TABLE_NAME)
      .where({ user_id: uuidToBuffer(userId) })
      .first();

    return row ? toDto(row) : defaultDto(userId);
  },

  async upsert(
    userId: string,
    payload: UpdateAccessibilitySettingsRequestDto,
  ): Promise<AccessibilitySettingsDto> {
    const persisted = toPersistencePayload(payload);

    await db(TABLE_NAME)
      .insert({
        user_id: uuidToBuffer(userId),
        font_scale: payload.fontScale ?? 1,
        high_contrast: payload.highContrast ? 1 : 0,
        simple_mode: payload.simpleMode ? 1 : 0,
        voice_confirmations: payload.voiceConfirmations ? 1 : 0,
      })
      .onConflict("user_id")
      .merge({
        ...persisted,
        updated_at: db.fn.now(),
      });

    return accessibilityRepository.findByUserId(userId);
  },
};
