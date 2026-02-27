import { Browser, BrowserContext } from "@playwright/test";
import { JWT } from "google-auth-library";

import { createIAPBrowserContext } from "./iap-auth-common";

const TOKEN_CACHE_DURATION_MS = 55 * 60 * 1000; // 55 minutes

export type ServiceAccountIAPConfig = {
  serviceAccountJson: string;
  targetAudience: string;
};

export type ServiceAccountCredentials = {
  auth_provider_x509_cert_url: string;
  auth_uri: string;
  client_email: string;
  client_id: string;
  client_x509_cert_url: string;
  private_key: string;
  private_key_id: string;
  project_id: string;
  token_uri: string;
  type: string;
};

type CachedToken = {
  expiresAt: number;
  token: string;
};

export class ServiceAccountIAPAuthHelper {
  private readonly audience: string;
  private readonly credentials: ServiceAccountCredentials;
  private cache?: CachedToken;

  constructor(config: ServiceAccountIAPConfig) {
    this.audience = config.targetAudience.trim();
    this.credentials = JSON.parse(config.serviceAccountJson) as ServiceAccountCredentials;
  }

  async getIdToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.token;
    }

    const token = await this.tokenFromServiceAccount();
    this.cache = { expiresAt: Date.now() + TOKEN_CACHE_DURATION_MS, token };
    return token;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    const token = await this.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(url, { ...options, headers });
  }

  async forceRefresh(): Promise<void> {
    this.cache = undefined;
    await this.getIdToken();
  }

  static fromEnv(): ServiceAccountIAPAuthHelper {
    const targetAudience = process.env.IAP_TARGET_AUDIENCE;
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!targetAudience) {
      throw new Error("IAP_TARGET_AUDIENCE environment variable is required");
    }

    if (!serviceAccountJson) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required for Service Account authentication",
      );
    }

    return new ServiceAccountIAPAuthHelper({ serviceAccountJson, targetAudience });
  }

  private async tokenFromServiceAccount(): Promise<string> {
    const client = new JWT({
      additionalClaims: { target_audience: this.audience },
      email: this.credentials.client_email,
      key: this.credentials.private_key,
    });

    const token = await client.fetchIdToken(this.audience);
    if (!token) {
      throw new Error("Unable to fetch IAP ID token using service account credentials");
    }

    return token;
  }
}

export const getServiceAccountIAPToken = async (): Promise<string> => {
  return ServiceAccountIAPAuthHelper.fromEnv().getIdToken();
};

export const makeServiceAccountIAPRequest = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  return ServiceAccountIAPAuthHelper.fromEnv().makeAuthenticatedRequest(url, options);
};

export async function createServiceAccountIAPContext(
  browser: Browser,
  baseUrl: string,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  const targetAudience = process.env.IAP_TARGET_AUDIENCE;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!targetAudience || !serviceAccountJson) {
    throw new Error(
      "Service Account IAP configuration is missing - IAP_TARGET_AUDIENCE and GOOGLE_SERVICE_ACCOUNT_JSON are required",
    );
  }

  const helper = new ServiceAccountIAPAuthHelper({
    serviceAccountJson,
    targetAudience,
  });

  return createIAPBrowserContext(browser, baseUrl, helper, options);
}
