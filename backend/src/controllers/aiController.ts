import { Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '../db/index';
import { AuthRequest } from '../middleware/auth';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GET /api/ai/summary — streams a weekly coaching summary via SSE
export const getWeeklySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Pull last 7 days of entries for this user
    const result = await query(
      `SELECT
        e.id, e.description, e.date, e.mood,
        COALESCE(
          json_agg(es.skill_name ORDER BY es.id) FILTER (WHERE es.skill_name IS NOT NULL),
          '[]'
        ) AS skills
       FROM entries e
       LEFT JOIN entry_skills es ON es.entry_id = e.id
       WHERE e.user_id = $1 AND e.date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY e.id
       ORDER BY e.date ASC`,
      [req.userId]
    );

    const entries = result.rows;

    if (entries.length === 0) {
      res.json({
        summary: "You haven't logged any entries in the last 7 days. Start tracking your work to get personalised coaching insights!",
      });
      return;
    }

    // Format entries into a readable prompt
    const entriesText = entries
      .map((e) => {
        const moodEmoji = ['', '😔', '😐', '🙂', '😊', '🚀'][e.mood];
        const skills = Array.isArray(e.skills) && e.skills.length > 0
          ? `Skills: ${e.skills.join(', ')}`
          : 'No skills tagged';
        return `Date: ${e.date}\nMood: ${moodEmoji} (${e.mood}/5)\n${skills}\n${e.description}`;
      })
      .join('\n\n---\n\n');

    // Build the coaching prompt
    const prompt = `You are a senior software engineer acting as a personal career coach for a developer.
Analyse the following work log entries from the past 7 days and provide an insightful, encouraging, and actionable coaching summary.

Your summary should cover:
1. **What they focused on** — what did they work on this week? What patterns do you see?
2. **What they're improving at** — based on the skills logged and descriptions, where is growth happening?
3. **What to prioritise next week** — 2-3 specific, actionable recommendations tailored to their actual work
4. **Encouragement** — a genuine, specific note about something they did well

Keep it conversational, warm, and genuinely useful. Write like a mentor who has actually read their work, not a generic motivational bot.
Be direct and specific — reference actual things from their log, not generic advice.

Here are their entries:

${entriesText}`;

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Stream the response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI summary error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate summary' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
};
