import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AccessibilityPage } from "@/pages/accessibility/AccessibilityPage";

vi.mock("@/contexts/AccessibilityContext", () => ({
  useAccessibility: vi.fn(),
}));

vi.mock("@/utils/accessibility", () => ({
  isSpeechSupported: vi.fn().mockReturnValue(false),
  hasCroatianVoice: vi.fn().mockReturnValue(false),
  speakText: vi.fn(),
  DEFAULT_PREFS: {
    fontSize: "normal",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    simplifiedView: false,
    voiceReadout: false,
  },
  loadPrefs: vi.fn().mockReturnValue({
    fontSize: "normal",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    simplifiedView: false,
    voiceReadout: false,
  }),
  savePrefs: vi.fn(),
  applyAccessibilitySettings: vi.fn(),
}));

vi.mock("@/components", () => ({
  AppIcon: () => null,
}));

import { useAccessibility } from "@/contexts/AccessibilityContext";

const defaultPrefs = {
  fontSize: "normal" as const,
  highContrast: false,
  reduceMotion: false,
  screenReader: false,
  simplifiedView: false,
  voiceReadout: false,
};

const mockAccessibility = (prefs = defaultPrefs) => {
  const updatePref = vi.fn();
  const resetPrefs = vi.fn();
  vi.mocked(useAccessibility).mockReturnValue({
    prefs,
    updatePref,
    resetPrefs,
    announce: vi.fn(),
  });
  return { updatePref, resetPrefs };
};

const renderPage = () => render(<AccessibilityPage />);

describe("AccessibilityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", () => {
    mockAccessibility();
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Postavke pristupačnosti" }),
    ).toBeInTheDocument();
  });

  it("renders the high contrast toggle in off state", () => {
    mockAccessibility({ ...defaultPrefs, highContrast: false });
    renderPage();
    const toggle = screen.getByLabelText("Uključi visoki kontrast");
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("renders the high contrast toggle in on state when enabled", () => {
    mockAccessibility({ ...defaultPrefs, highContrast: true });
    renderPage();
    const toggle = screen.getByLabelText("Uključi visoki kontrast");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("calls updatePref when high contrast toggle is clicked", () => {
    const { updatePref } = mockAccessibility();
    renderPage();
    fireEvent.click(screen.getByLabelText("Uključi visoki kontrast"));
    expect(updatePref).toHaveBeenCalledWith("highContrast", true);
  });

  it("calls resetPrefs when reset button is clicked", () => {
    const { resetPrefs } = mockAccessibility();
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /vrati na zadane/i }));
    expect(resetPrefs).toHaveBeenCalled();
  });

  it("renders simplified view toggle", () => {
    mockAccessibility();
    renderPage();
    expect(screen.getByLabelText("Uključi pojednostavljen prikaz")).toBeInTheDocument();
  });

  it("calls updatePref with opposite value when simplified view toggle is clicked", () => {
    const { updatePref } = mockAccessibility({ ...defaultPrefs, simplifiedView: false });
    renderPage();
    fireEvent.click(screen.getByLabelText("Uključi pojednostavljen prikaz"));
    expect(updatePref).toHaveBeenCalledWith("simplifiedView", true);
  });
});
