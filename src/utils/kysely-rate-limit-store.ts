import RateLimit, {type RateLimitOptions} from 'koa2-ratelimit';
import {sql} from 'kysely';
import {db} from '#db/index.js';

export class KyselyRateLimitStore extends RateLimit.Stores.Store {
  async incr(key: string, options: RateLimitOptions, weight: number) {
    const interval = 60 * 1000; // Default 1 minute in milliseconds
    const now = new Date();
    const dateEnd = new Date(now.getTime() + interval);

    // Check if the key exists
    const existingKey = await db
      .selectFrom('rate_limiters')
      .select(['key', 'counter', 'date_end'])
      .where('key', '=', key)
      .executeTakeFirst();

    if (existingKey) {
      // Update the existing key's counter and extend date_end if needed
      const updatedKey = await db
        .updateTable('rate_limiters')
        .set({
          counter: sql`counter + ${weight}`,
          // Only update date_end if the new date is further in the future
          date_end: sql`CASE WHEN ${dateEnd} > date_end THEN ${dateEnd} ELSE date_end END`,
        })
        .where('key', '=', key)
        .returning(['counter', 'date_end'])
        .executeTakeFirstOrThrow();

      return {
        counter: updatedKey.counter,
        dateEnd: updatedKey.date_end.getTime(),
      };
    }

    // Create a new key
    const newKey = await db
      .insertInto('rate_limiters')
      .values({
        key,
        counter: weight,
        date_end: dateEnd,
      })
      .returning(['counter', 'date_end'])
      .executeTakeFirstOrThrow();

    return {
      counter: newKey.counter,
      dateEnd: newKey.date_end.getTime(),
    };
  }

  async decrement(key: string, options: RateLimitOptions, weight: number) {
    const existingKey = await db
      .selectFrom('rate_limiters')
      .select(['key', 'counter', 'date_end'])
      .where('key', '=', key)
      .executeTakeFirst();

    if (existingKey) {
      // Only decrement if counter is greater than weight to avoid negative values
      await db
        .updateTable('rate_limiters')
        .set({
          counter: sql`CASE WHEN counter > ${weight} THEN counter - ${weight} ELSE 0 END`,
        })
        .where('key', '=', key)
        .execute();
    }
  }

  async saveAbuse(
    options: RateLimitOptions & {key: string; ip: string; user_id: number},
  ) {
    const now = new Date();
    const dateEnd = new Date(now.getTime() + (options.interval as number));

    // Try to find an existing abuse record
    const rateLimit = await db
      .selectFrom('rate_limit_abuse')
      .selectAll()
      .where('key', '=', options.key)
      .executeTakeFirst();

    if (rateLimit) {
      // Update existing abuse record
      await db
        .updateTable('rate_limit_abuse')
        .set({
          nb_hit: (rateLimit.nb_hit ?? 0) + 1,
          date_end: dateEnd,
        })
        .where('key', '=', options.key)
        .execute();
    } else {
      // Create a new abuse record
      await db
        .insertInto('rate_limit_abuse')
        .values({
          key: options.key,
          prefix: options.prefixKey,
          nb_max: options.max,
          nb_hit: 1,
          interval: String(options.interval as number),
          ip: options.ip,
          user_id: options.user_id,
          date_end: dateEnd,
        })
        .execute();
    }
  }

  // Add a cleanup method to periodically remove expired rate limits
  async cleanup() {
    const now = new Date();

    // Remove expired rate limiter records
    await db.deleteFrom('rate_limiters').where('date_end', '<', now).execute();

    // Optionally remove expired abuse records after some retention period
    await db
      .deleteFrom('rate_limit_abuse')
      .where('date_end', '<', new Date(now.getTime() - 86_400_000)) // 24 hours retention
      .execute();
  }
}
