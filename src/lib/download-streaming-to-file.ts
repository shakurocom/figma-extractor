import axios from 'axios';
import fs from 'fs';

const MAX_RETRIES = 7;
const BASE_RETRY_TIMEOUT_MS = 1000;
const MAX_RETRY_TIMEOUT_MS = 30000;

let globalRateLimitCooldownUntil = 0;

const sleep = (timeoutMs: number) =>
  new Promise(resolve => {
    setTimeout(resolve, timeoutMs);
  });

const getHeader = (headers: any, name: string): string | undefined => {
  if (!headers) return undefined;

  if (typeof headers.get === 'function') {
    const byGetter = headers.get(name) ?? headers.get(name.toLowerCase());

    return byGetter ? `${byGetter}` : undefined;
  }

  return headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()] ?? undefined;
};

const parseRetryAfterMs = (value: string | undefined): number | undefined => {
  if (!value) return undefined;

  const seconds = Number(value);
  if (!Number.isNaN(seconds) && Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateInMs = Date.parse(value);
  if (Number.isNaN(dateInMs)) {
    return undefined;
  }

  return Math.max(dateInMs - Date.now(), 0);
};

const parseRateLimitResetMs = (value: string | undefined): number | undefined => {
  if (!value) return undefined;

  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return undefined;
  }

  const resetAtMs = parsed < 1_000_000_000_000 ? parsed * 1000 : parsed;

  return Math.max(resetAtMs - Date.now(), 0);
};

const resolveRetryTimeoutMs = (attempt: number, error: any): number => {
  const retryAfterMs = parseRetryAfterMs(getHeader(error?.response?.headers, 'retry-after'));
  const rateLimitResetMs = parseRateLimitResetMs(
    getHeader(error?.response?.headers, 'x-ratelimit-reset'),
  );

  const suggestedTimeoutMs = Math.max(retryAfterMs ?? 0, rateLimitResetMs ?? 0);
  const fallbackTimeoutMs = Math.min(BASE_RETRY_TIMEOUT_MS * 2 ** attempt, MAX_RETRY_TIMEOUT_MS);

  const jitterMs = Math.floor(Math.random() * 250);

  return Math.max(suggestedTimeoutMs, fallbackTimeoutMs) + jitterMs;
};

export const downloadStreamingToFile = async function (
  uri: string,
  filename: string,
  headers?: Record<string, string>,
) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const now = Date.now();
    const waitForGlobalCooldownMs = Math.max(globalRateLimitCooldownUntil - now, 0);
    if (waitForGlobalCooldownMs > 0) {
      await sleep(waitForGlobalCooldownMs);
    }

    try {
      const response = await axios({
        url: uri,
        method: 'GET',
        responseType: 'stream',
        headers: { ...headers },
      });

      return await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filename);
        response.data.pipe(writer);
        writer.on('finish', () => resolve(filename));
        writer.on('error', reject);
      });
    } catch (err: any) {
      const isRateLimitError = err?.response?.status === 429;
      const hasRetriesLeft = attempt < MAX_RETRIES;
      if (!isRateLimitError || !hasRetriesLeft) {
        throw err;
      }

      const retryTimeoutMs = resolveRetryTimeoutMs(attempt, err);
      globalRateLimitCooldownUntil = Math.max(
        globalRateLimitCooldownUntil,
        Date.now() + retryTimeoutMs,
      );
      await sleep(retryTimeoutMs);
    }
  }

  throw new Error(`Unexpected error while downloading "${uri}"`);
};
