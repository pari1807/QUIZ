import { getRedisClient } from '../config/redis.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';

/**
 * Performance Service
 * Tracks daily student scores for the real-time leaderboard.
 */
export const performanceService = {
  /**
   * Update student score for the day
   * @param {string} userId - ID of the student
   * @param {number} points - Points to add
   */
  updateScore: async (userId, points, reason = '') => {
    try {
      const redis = getRedisClient();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `leaderboard:daily:${today}`;

      if (redis) {
        // Increment score in Redis ZSET
        await redis.zIncrBy(key, points, userId.toString());
        // Set expiry to 48 hours to clean up old leaderboards
        await redis.expire(key, 172800);

        // Fetch user info for broadcast if reason exists
        let userInfo = null;
        if (reason) {
           const user = await User.findById(userId).select('username');
           userInfo = { username: user?.username || 'Student', points, reason };
        }

        // Notify admins of the update
        await performanceService.broadcastTopPerformers(userInfo);
      }
    } catch (err) {
      console.error('Error updating performance score:', err.message);
    }
  },

  /**
   * Get top 3 performers for the day
   */
  getTopPerformers: async () => {
    try {
      const redis = getRedisClient();
      const today = new Date().toISOString().split('T')[0];
      const key = `leaderboard:daily:${today}`;

      let topUsers = [];

      if (redis) {
        // Get top 3 from Redis
        const rawTop = await redis.zRangeWithScores(key, 0, 2, { REV: true });
        
        if (rawTop.length > 0) {
          const userIds = rawTop.map(item => item.value);
          const users = await User.find({ _id: { $in: userIds } })
            .select('username avatar');

          topUsers = rawTop.map(item => {
            const user = users.find(u => u._id.toString() === item.value);
            return {
              userId: item.value,
              username: user?.username || 'Unknown',
              avatar: user?.avatar || '',
              score: item.score
            };
          }).sort((a, b) => b.score - a.score);
        }
      }

      // Fallback or empty list
      return topUsers;
    } catch (err) {
      console.error('Error fetching top performers:', err.message);
      return [];
    }
  },

  /**
   * Broadcast top performers to all connected admins
   */
  broadcastTopPerformers: async (recentActivity = null) => {
    try {
      const io = getIO();
      const topPerformers = await performanceService.getTopPerformers();
      io.to('admin:dashboard').emit('top_performers_update', { topPerformers, recentActivity });
    } catch (err) {
      // Socket not ready yet or other error
      console.warn('Could not broadcast top performers:', err.message);
    }
  }
};

export default performanceService;
