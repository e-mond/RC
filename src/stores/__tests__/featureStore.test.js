import { describe, expect, test, beforeEach } from "vitest";
import { useFeatureStore } from "../featureStore";

describe("featureStore", () => {
  beforeEach(() => {
    useFeatureStore.setState({ plan: "free" });
  });

  test("setPlan enforces valid values", () => {
    useFeatureStore.getState().setPlan("premium");
    expect(useFeatureStore.getState().plan).toBe("premium");

    useFeatureStore.getState().setPlan("unknown");
    expect(useFeatureStore.getState().plan).toBe("free");
  });

  test("togglePlan switches between free and premium", () => {
    useFeatureStore.getState().togglePlan();
    expect(useFeatureStore.getState().plan).toBe("premium");
    useFeatureStore.getState().togglePlan();
    expect(useFeatureStore.getState().plan).toBe("free");
  });

  test("isPremium helper reflects plan", () => {
    expect(useFeatureStore.getState().isPremium()).toBe(false);
    useFeatureStore.setState({ plan: "premium" });
    expect(useFeatureStore.getState().isPremium()).toBe(true);
  });
});

