import Constants from "expo-constants";

// API base URL. Defaults to the live ClientFlow production deployment, but can
// be overridden via the EXPO_PUBLIC_API_URL env var (e.g. to a local dev server
// or a preview deployment) without code changes.
const FALLBACK_API_URL = "https://client-flow-umber-five.vercel.app";

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

export const API_URL = (fromEnv || fromExtra || FALLBACK_API_URL).replace(/\/$/, "");

export const DEMO_CREDENTIALS = {
  email: "demo@clientflow.app",
  password: "ChangeMe123!",
};
