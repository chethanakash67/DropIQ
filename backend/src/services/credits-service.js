const db = require('../database/db');

const REFRESH_HOURS = 12;
const REFRESH_INTERVAL_SQL = `${REFRESH_HOURS} hours`;

const REFRESH_BY_PLAN = {
  free: 20,
  pro: 50,
  max: 75,
  premium: 75,
};

function normalizePlanType(planType) {
  if (!planType) return 'free';
  const normalized = String(planType).toLowerCase();
  if (normalized === 'premium') return 'max';
  if (normalized === 'pro' || normalized === 'max' || normalized === 'free') return normalized;
  return 'free';
}

function getPlanRefreshCredits(planType) {
  return REFRESH_BY_PLAN[planType] ?? REFRESH_BY_PLAN.free;
}

class InsufficientCreditsError extends Error {
  constructor(required, available) {
    super(`Insufficient credits: requires ${required}, available ${available}`);
    this.name = 'InsufficientCreditsError';
    this.required = required;
    this.available = available;
  }
}

async function maybeRefreshCreditsForUser(userId) {
  const query = `
    WITH selected AS (
      SELECT
        id,
        plan_type,
        credits,
        credits_last_refreshed
      FROM users
      WHERE id = $1
      FOR UPDATE
    ),
    refreshed AS (
      UPDATE users u
      SET
        credits = CASE
          WHEN selected.credits_last_refreshed IS NULL OR selected.credits_last_refreshed <= NOW() - INTERVAL '${REFRESH_INTERVAL_SQL}'
            THEN CASE LOWER(selected.plan_type)
              WHEN 'pro' THEN 50
              WHEN 'premium' THEN 75
              WHEN 'max' THEN 75
              ELSE 20
            END
          ELSE selected.credits
        END,
        credits_last_refreshed = CASE
          WHEN selected.credits_last_refreshed IS NULL OR selected.credits_last_refreshed <= NOW() - INTERVAL '${REFRESH_INTERVAL_SQL}'
            THEN NOW()
          ELSE selected.credits_last_refreshed
        END
      FROM selected
      WHERE u.id = selected.id
      RETURNING u.id, u.plan_type, u.credits, u.credits_last_refreshed
    )
    SELECT * FROM refreshed
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0] || null;
}

async function maybeRefreshAndGetUser(userId) {
  const updated = await maybeRefreshCreditsForUser(userId);
  if (!updated) return null;
  return {
    ...updated,
    plan_type: normalizePlanType(updated.plan_type),
  };
}

// Cache to prevent double-charging within a short window (e.g. React StrictMode or double-clicks)
const recentDeductions = new Map(); // userId -> { time: timestamp, cost: number }
const DEDUCTION_GUARD_MS = 3000; // 3 seconds

async function consumeCredits(userId, cost) {
  // Guard against rapid duplicate charges
  const now = Date.now();
  const recent = recentDeductions.get(userId);
  if (recent && recent.cost === cost && (now - recent.time) < DEDUCTION_GUARD_MS) {
    console.log(`[Credits] Skipping duplicate charge for user ${userId} (within ${DEDUCTION_GUARD_MS}ms)`);
    // Return current user state without deducting again
    const user = await db.query('SELECT id, plan_type, credits, credits_last_refreshed FROM users WHERE id = $1', [userId]);
    const row = user.rows[0];
    return {
      ...row,
      plan_type: normalizePlanType(row.plan_type),
    };
  }

  await db.query('BEGIN');
  try {
    const updated = await maybeRefreshCreditsForUser(userId);
    if (!updated) throw new Error('User not found');

    const available = Number(updated.credits || 0);
    if (available < cost) {
      throw new InsufficientCreditsError(cost, available);
    }

    const deduction = await db.query(
      `
      UPDATE users
      SET credits = credits - $1
      WHERE id = $2
      RETURNING id, plan_type, credits, credits_last_refreshed
      `,
      [cost, userId]
    );

    await db.query('COMMIT');
    const row = deduction.rows[0];
    
    // Update guard for next request
    recentDeductions.set(userId, { time: Date.now(), cost });

    return {
      ...row,
      plan_type: normalizePlanType(row.plan_type),
    };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

module.exports = {
  REFRESH_HOURS,
  normalizePlanType,
  getPlanRefreshCredits,
  maybeRefreshAndGetUser,
  consumeCredits,
  InsufficientCreditsError,
};
