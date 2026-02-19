const express = require("express");
const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

const router = express.Router();

const redis = Redis.fromEnv();

// News rate limit: 1 every 30 seconds
const newsLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, '30 s'),
  prefix: '@upstash/ratelimit/news'
});

// News rate limit middleware (1 every 30 seconds)
const validateNewsRateLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "User ID required" });

  const { success } = await newsLimit.limit(`news:${userId}`);
  
  if (!success) {
    return res.status(429).json({
      error: "News: 1 request every 30 seconds",
      reset: Math.floor(newsLimit.limitMs / 1000)
    });
  }
  next();
};

// News endpoint
router.get("/news", validateNewsRateLimit, async (req, res) => {
  try {
    const { q, country = "us", category, pageSize = 10 } = req.query;
    const apiKey = process.env.NEWS_API;
    
    if (!apiKey) {
      return res.status(500).json({ error: "NewsAPI key not configured" });
    }

    const params = new URLSearchParams({
      country,
      pageSize,
      apiKey
    });
    
    if (q) params.append("q", q);
    if (category) params.append("category", category);

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?${params}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "NewsAPI error", message: error.message });
  }
});

module.exports = router;
