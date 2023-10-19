import { Telegraf } from "telegraf";
import { SocksProxyAgent } from "socks-proxy-agent";

export const TELEGRAM_BOT_TOKEN: string = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const bot = new Telegraf(TELEGRAM_BOT_TOKEN, {
  telegram: {
    agent:
      process.env.NODE_ENV === "development"
        ? new SocksProxyAgent("socks://127.0.0.1:8443")
        : undefined,
  },
});
