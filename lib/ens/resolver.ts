import { ethers } from "ethers";

const RPC_ENDPOINTS = [
  process.env.ETHEREUM_RPC_URL,
  "https://eth.drpc.org",
  "https://rpc.ankr.com/eth",
  "https://ethereum.publicnode.com",
  "https://eth.llamarpc.com",
].filter(Boolean) as string[];

let provider: ethers.JsonRpcProvider | null = null;
let currentRpcIndex = 0;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[currentRpcIndex]);
  }
  return provider;
}

function rotateProvider(): void {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[currentRpcIndex]);
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      rotateProvider();
    }
  }
  throw lastError;
}

export async function resolveENSName(name: string): Promise<string | null> {
  try {
    return await withRetry(() => getProvider().resolveName(name));
  } catch {
    return null;
  }
}

export async function lookupAddress(address: string): Promise<string | null> {
  try {
    return await withRetry(() => getProvider().lookupAddress(address));
  } catch {
    return null;
  }
}

export async function getENSAvatar(name: string): Promise<string | null> {
  try {
    const resolver = await withRetry(() => getProvider().getResolver(name));
    if (!resolver) return null;
    return await resolver.getAvatar();
  } catch {
    return null;
  }
}

export async function getENSText(
  name: string,
  key: string,
): Promise<string | null> {
  try {
    const resolver = await withRetry(() => getProvider().getResolver(name));
    if (!resolver) return null;
    return await resolver.getText(key);
  } catch {
    return null;
  }
}

const COMMON_TEXT_RECORDS = [
  "email",
  "url",
  "avatar",
  "description",
  "notice",
  "keywords",
  "com.discord",
  "com.github",
  "com.reddit",
  "com.twitter",
  "org.telegram",
  "io.keybase",
];

async function getTextRecordWithRetry(
  name: string,
  key: string,
  retries = 3,
): Promise<string | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const resolver = await getProvider().getResolver(name);
      if (!resolver) return null;
      const value = await resolver.getText(key);
      return value;
    } catch {
      rotateProvider();
    }
  }
  return null;
}

export async function getAllTextRecords(
  name: string,
): Promise<Record<string, string>> {
  const records: Record<string, string> = {};

  const results = await Promise.allSettled(
    COMMON_TEXT_RECORDS.map(async (key) => {
      const value = await getTextRecordWithRetry(name, key);
      return { key, value };
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.value) {
      records[result.value.key] = result.value.value;
    }
  }

  return records;
}
