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
router.get("/everything", validateNewsRateLimit, async (req, res) => {
  try {
    const { q, sortBy = "publishedAt", pageSize = 20, page = 1 } = req.query;
    const apiKey = process.env.NEWS_API;
    
    if (!apiKey) {
      return res.status(500).json({ error: "NewsAPI key not configured" });
    }

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const params = new URLSearchParams({
      q,
      sortBy,
      pageSize: Math.min(pageSize, 100).toString(),
      page: page.toString(),
      apiKey
    });

    const response = await fetch(
      `https://newsapi.org/v2/everything?${params}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ 
        error: "NewsAPI error", 
        message: errorData.message || `HTTP ${response.status}` 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("NewsAPI Error:", error);
    res.status(500).json({ error: "NewsAPI error", message: error.message });
  }
});


module.exports = router;
