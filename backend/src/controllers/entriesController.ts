import { Response } from 'express';
import { query } from '../db/index';
import { AuthRequest } from '../middleware/auth';

const ENTRY_SELECT = `
  SELECT
    e.id, e.title, e.description, e.date, e.mood, e.duration, e.created_at,
    COALESCE(
      json_agg(es.skill_name ORDER BY es.id) FILTER (WHERE es.skill_name IS NOT NULL),
      '[]'
    ) AS skills
  FROM entries e
  LEFT JOIN entry_skills es ON es.entry_id = e.id
`;

// GET /api/entries — fetch all entries for the logged-in user
export const getEntries = async (req: AuthRequest, res: Response): Promise<void> => {
  const { skill, from, to, limit = '50', offset = '0' } = req.query as Record<string, string>;

  try {
    let sql = ENTRY_SELECT + ` WHERE e.user_id = $1`;
    const params: unknown[] = [req.userId];
    let paramIndex = 2;

    if (skill) {
      sql += ` AND EXISTS (
        SELECT 1 FROM entry_skills WHERE entry_id = e.id AND skill_name ILIKE $${paramIndex}
      )`;
      params.push(`%${skill}%`);
      paramIndex++;
    }

    if (from) {
      sql += ` AND e.date >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }

    if (to) {
      sql += ` AND e.date <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }

    sql += ` GROUP BY e.id ORDER BY e.date DESC, e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('GetEntries error:', err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

// GET /api/entries/:id — fetch a single entry
export const getEntryById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      ENTRY_SELECT + ` WHERE e.id = $1 AND e.user_id = $2 GROUP BY e.id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GetEntryById error:', err);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
};

// POST /api/entries — create a new entry
export const createEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, mood, duration, skills } = req.body;

  if (!description || !mood) {
    res.status(400).json({ error: 'Description and mood are required' });
    return;
  }

  if (mood < 1 || mood > 5) {
    res.status(400).json({ error: 'Mood must be between 1 and 5' });
    return;
  }

  try {
    const entryResult = await query(
      `INSERT INTO entries (user_id, title, description, date, mood, duration)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.userId,
        title || null,
        description,
        date || new Date().toISOString().split('T')[0],
        mood,
        duration || null,
      ]
    );

    const entry = entryResult.rows[0];

    if (skills && Array.isArray(skills) && skills.length > 0) {
      const skillValues = skills
        .map((_: string, i: number) => `($1, $${i + 2})`)
        .join(', ');
      await query(
        `INSERT INTO entry_skills (entry_id, skill_name) VALUES ${skillValues}`,
        [entry.id, ...skills]
      );
    }

    const full = await query(
      ENTRY_SELECT + ` WHERE e.id = $1 GROUP BY e.id`,
      [entry.id]
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error('CreateEntry error:', err);
    res.status(500).json({ error: 'Failed to create entry' });
  }
};

// DELETE /api/entries/:id
export const deleteEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await query(
      'DELETE FROM entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error('DeleteEntry error:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

// GET /api/entries/stats — dashboard stats for the logged-in user
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalResult, weekResult, skillsResult, activityResult, streakResult] =
      await Promise.all([
        query('SELECT COUNT(*) AS total FROM entries WHERE user_id = $1', [req.userId]),
        query(
          `SELECT COUNT(*) AS this_week FROM entries
           WHERE user_id = $1 AND date >= DATE_TRUNC('week', CURRENT_DATE)`,
          [req.userId]
        ),
        query(
          `SELECT es.skill_name, COUNT(*) AS count
           FROM entry_skills es
           JOIN entries e ON e.id = es.entry_id
           WHERE e.user_id = $1
           GROUP BY es.skill_name
           ORDER BY count DESC
           LIMIT 10`,
          [req.userId]
        ),
        query(
          `SELECT date::text, COUNT(*) AS count
           FROM entries
           WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'
           GROUP BY date
           ORDER BY date ASC`,
          [req.userId]
        ),
        query(
          `WITH daily AS (
            SELECT DISTINCT date FROM entries WHERE user_id = $1 ORDER BY date DESC
          ),
          numbered AS (
            SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) AS rn FROM daily
          )
          SELECT COUNT(*) AS streak
          FROM numbered
          WHERE date = CURRENT_DATE - (rn - 1) * INTERVAL '1 day'`,
          [req.userId]
        ),
      ]);

    res.json({
      totalEntries: parseInt(totalResult.rows[0].total),
      thisWeek: parseInt(weekResult.rows[0].this_week),
      skillsLogged: skillsResult.rows.length,
      currentStreak: parseInt(streakResult.rows[0]?.streak || '0'),
      topSkills: skillsResult.rows,
      weekActivity: activityResult.rows,
    });
  } catch (err) {
    console.error('GetStats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
