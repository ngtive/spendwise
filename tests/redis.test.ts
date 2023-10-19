import { redisClient } from "../src/redis";
import redisSession from "../src/redis-session/redis-session";

describe("Test redis connectivity", () => {
  test("Test redis set some keys", async () => {
    await redisClient.set("test", "test");
    let result = await redisClient.get("test");
    expect(result).toBe("test");
    await redisClient.del("test");
  });

  test("Test redis-session", async () => {
    await redisSession.saveSession("12345", {
      data: "test",
    });
    const result = await redisSession.getSession("12345");
    expect(result.data).toBe("test");
    await redisSession.clearSession("12345");
  });
});
