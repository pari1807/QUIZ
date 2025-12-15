// Spam detection service

class SpamDetectionService {
  // Check if message contains spam
  detectSpam(content) {
    const spamKeywords = [
      'viagra',
      'casino',
      'lottery',
      'prize',
      'winner',
      'click here',
      'free money',
      'earn money fast',
    ];

    const lowerContent = content.toLowerCase();
    
    // Check for spam keywords
    const hasSpamKeywords = spamKeywords.some((keyword) =>
      lowerContent.includes(keyword)
    );

    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    const excessiveCaps = capsRatio > 0.7 && content.length > 10;

    // Check for excessive links
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    const excessiveLinks = linkCount > 3;

    // Check for excessive emojis
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    const excessiveEmojis = emojiCount > 10;

    // Calculate spam score
    let spamScore = 0;
    if (hasSpamKeywords) spamScore += 40;
    if (excessiveCaps) spamScore += 20;
    if (excessiveLinks) spamScore += 30;
    if (excessiveEmojis) spamScore += 10;

    return {
      isSpam: spamScore >= 50,
      spamScore,
      reasons: {
        spamKeywords: hasSpamKeywords,
        excessiveCaps,
        excessiveLinks,
        excessiveEmojis,
      },
    };
  }

  // Check for suspicious patterns
  detectSuspiciousContent(content) {
    // Check for repeated characters
    const repeatedChars = /(.)\1{10,}/.test(content);

    // Check if content is too short
    const tooShort = content.trim().length < 2;

    // Check for only special characters
    const onlySpecialChars = /^[^a-zA-Z0-9]+$/.test(content);

    return {
      isSuspicious: repeatedChars || tooShort || onlySpecialChars,
      reasons: {
        repeatedChars,
        tooShort,
        onlySpecialChars,
      },
    };
  }

  // Rate limiting check (simple in-memory implementation)
  messageRateLimits = new Map();

  checkRateLimit(userId, maxMessages = 10, timeWindow = 60000) {
    const now = Date.now();
    const userMessages = this.messageRateLimits.get(userId) || [];

    // Filter messages within time window
    const recentMessages = userMessages.filter(
      (timestamp) => now - timestamp < timeWindow
    );

    if (recentMessages.length >= maxMessages) {
      return {
        limited: true,
        retryAfter: timeWindow - (now - recentMessages[0]),
      };
    }

    // Add current message
    recentMessages.push(now);
    this.messageRateLimits.set(userId, recentMessages);

    return { limited: false };
  }

  // Clean up old rate limit data periodically
  cleanupRateLimits() {
    const now = Date.now();
    const timeWindow = 60000;

    for (const [userId, timestamps] of this.messageRateLimits.entries()) {
      const recentMessages = timestamps.filter(
        (timestamp) => now - timestamp < timeWindow
      );

      if (recentMessages.length === 0) {
        this.messageRateLimits.delete(userId);
      } else {
        this.messageRateLimits.set(userId, recentMessages);
      }
    }
  }
}

const spamDetectionService = new SpamDetectionService();

export default spamDetectionService;

// Run cleanup every minute
setInterval(() => {
  spamDetectionService.cleanupRateLimits();
}, 60000);
