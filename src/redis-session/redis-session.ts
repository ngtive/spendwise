import { redisClient } from "../redis";
import Redis from "ioredis";
import { Context } from "telegraf";

interface OptionInterface {
  ttl: number;
}

class RedisSession {
  private client: Redis;
  private options: OptionInterface = {
    ttl: 300,
  };

  constructor(ttl: number = 300) {
    this.client = redisClient;
    this.options.ttl = ttl;
  }

  async getSession(key: string): Promise<any | null> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  async clearSession(key: string): Promise<boolean> {
    return (await this.client.del(key)) > 0;
  }

  async saveSession(key: string, session: any): Promise<boolean> {
    if (!session) {
      return this.clearSession(key);
    }
    return !!(await this.client.setex(
      key,
      this.options.ttl,
      JSON.stringify(session),
    ));
  }

  middleware() {
    return (ctx: Context, next: Function) => {
      const key = ctx?.message?.chat.id
        ? ctx?.message?.chat.id.toString()
        : null;
      if (!key) {
        return next();
      }
      return this.getSession(key).then((session) => {
        Object.defineProperty(ctx, "session", {
          get: function () {
            return session;
          },
          set: function (newValue) {
            session = Object.assign({}, newValue);
          },
        });
        return next().then(() => this.saveSession(key, session));
      });
    };
  }
}

export default new RedisSession(3600);
