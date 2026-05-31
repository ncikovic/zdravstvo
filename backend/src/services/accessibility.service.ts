import type {
  AccessibilitySettingsDto,
  UpdateAccessibilitySettingsRequestDto,
} from "@zdravstvo/contracts";

import { accessibilityRepository } from "../repositories/index.js";

export const accessibilityService = {
  async getSettings(userId: string): Promise<AccessibilitySettingsDto> {
    return accessibilityRepository.findByUserId(userId);
  },

  async updateSettings(
    userId: string,
    payload: UpdateAccessibilitySettingsRequestDto,
  ): Promise<AccessibilitySettingsDto> {
    return accessibilityRepository.upsert(userId, payload);
  },
};
