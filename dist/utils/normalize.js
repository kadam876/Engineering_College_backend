"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeString = normalizeString;
exports.parsePositiveInt = parsePositiveInt;
exports.parseOptionalFloat = parseOptionalFloat;
function normalizeString(value) {
    if (typeof value !== "string")
        return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed.toLowerCase() : undefined;
}
function parsePositiveInt(value, fallback, max) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1)
        return fallback;
    if (max !== undefined && parsed > max)
        return max;
    return parsed;
}
function parseOptionalFloat(value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    const parsed = Number.parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : undefined;
}
