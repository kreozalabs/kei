import { describe, it, expect } from "vitest";
import { timeToMinutes, minutesToTime, isNextDay, formatTime } from "./time";
import { TIME_FORMATS } from "../constants";

describe("time utils", () => {
  it("converts time to minutes", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("01:30")).toBe(90);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("converts minutes to time", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(90)).toBe("01:30");
    expect(minutesToTime(1439)).toBe("23:59");
    expect(minutesToTime(1440)).toBe("00:00"); // rolls over
  });

  it("checks if endTime is on next day", () => {
    expect(isNextDay("22:00", "02:00")).toBe(true);
    expect(isNextDay("09:00", "17:00")).toBe(false);
  });

  it("formats time correctly", () => {
    expect(formatTime("16:00", TIME_FORMATS.H12)).toBe("4:00pm");
    expect(formatTime("16:00", TIME_FORMATS.H24)).toBe("16:00");
  });
});
