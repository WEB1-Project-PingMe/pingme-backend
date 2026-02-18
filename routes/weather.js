const express = require("express");
const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

const router = express.Router();

const redis = Redis.fromEnv();

// Current: 6/hour (1 every 10min)
const currentLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(6, "1 h"),
  prefix: "@upstash/ratelimit/weather"
});

// Forecast rate limit middleware (1 per day)
const validateForecastRateLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "User ID required" });

  const today = new Date().toISOString().slice(0, 10);
  const { success } = await currentLimit.limit(`forecast:${userId}:${today}`);
  
  if (!success) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return res.status(429).json({
      error: "Forecast: 1 request per day (resets midnight)",
      reset: Math.floor((tomorrow - new Date()) / 1000)
    });
  }
  next();
};

const validateCurrentRateLimit = async (req, res, next) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "User ID required" });

  const { success } = await currentLimit.limit(`current:${userId}`);
  
  if (!success) {
    return res.status(429).json({
      error: "Current weather: 1 request every 10 minutes",
      reset: Math.floor(currentLimit.limitMs / 1000)
    });
  }
  next();
};

// Current weather endpoint
router.get("/current", validateCurrentRateLimit, async (req, res) => {
  try {
    const { q = "auto:ip" } = req.query;
    const apiKey = process.env.WEATHER_API;
    
    if (!apiKey) {
      return res.status(500).json({ error: "WeatherAPI key not configured" });
    }

    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "WeatherAPI error", message: error.message });
  }
});

// Forecast endpoint
router.get("/forecast", validateForecastRateLimit, async (req, res) => {
  try {
    const { q = "auto:ip", days = 3, dt, hour } = req.query;
    const apiKey = process.env.WEATHER_API;
    
    if (!apiKey) {
      return res.status(500).json({ error: "WeatherAPI key not configured" });
    }

    const params = new URLSearchParams({ key: apiKey, q, days });
    if (dt) params.append("dt", dt);
    if (hour) params.append("hour", hour);

    const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "WeatherAPI error", message: error.message });
  }
});

module.exports = router;
