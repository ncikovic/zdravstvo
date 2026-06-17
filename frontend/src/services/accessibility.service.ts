import type {
  AccessibilitySettingsDto,
  UpdateAccessibilitySettingsRequestDto,
} from "@zdravstvo/contracts";

import { apiClient } from "@/services/api";

export const accessibilityService = {
  async getCurrentUserSettings(): Promise<AccessibilitySettingsDto> {
    const response = await apiClient.get<AccessibilitySettingsDto>("/accessibility/me");
    return response.data;
  },

  async updateCurrentUserSettings(
    data: UpdateAccessibilitySettingsRequestDto,
  ): Promise<AccessibilitySettingsDto> {
    const response = await apiClient.put<AccessibilitySettingsDto>(
      "/accessibility/me",
      data,
    );
    return response.data;
  },
};
