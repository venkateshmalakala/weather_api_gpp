require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();

// 1. SETUP & CONFIGURATION
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;
const CITY = process.env.WEATHER_CITY;

// Validate Environment Variables
if (!API_KEY || !CITY) {
    console.error("ERROR: Missing API_KEY or CITY in .env file");
    process.exit(1);
}

// 2. DATABASE SETUP (SQLite)
const db = new sqlite3.Database('./weather.db', (err) => {
    if (err) console.error("Database Error:", err.message);
    else console.log("Connected to SQLite database.");
});

// Create Table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS weather_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT,
        temperature REAL,
        humidity INTEGER,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// 3. THE "ROBOT" (Fetch Weather Function)
const fetchWeatherData = async () => {
    try {
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        // Prepare data for DB
        const location = data.name;
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const desc = data.weather[0].description;

        // Insert into DB
        const query = `INSERT INTO weather_logs (location, temperature, humidity, description) VALUES (?, ?, ?, ?)`;
        db.run(query, [location, temp, humidity, desc], function(err) {
            if (err) {
                console.error("Error saving to DB:", err.message);
            } else {
                console.log(`[${new Date().toISOString()}] Weather logged: ${location} - ${temp}°C`);
            }
        });

    } catch (error) {
        console.error("Error fetching weather:", error.message);
    }
};

// 4. SCHEDULER (Run every hour)
// '0 * * * *' means "At minute 0 of every hour"
cron.schedule('0 * * * *', () => {
    console.log("Running scheduled weather task...");
    fetchWeatherData();
});

// 5. API ENDPOINTS

// GET /weather/current - Get the latest log
app.get('/weather/current', (req, res) => {
    const query = `SELECT * FROM weather_logs ORDER BY id DESC LIMIT 1`;
    
    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "No weather data found." });
        }
        res.json(row);
    });
});

// GET /weather/history - Get all logs (with optional date filters)
app.get('/weather/history', (req, res) => {
    const { start_date, end_date } = req.query;
    let query = `SELECT * FROM weather_logs`;
    const params = [];

    // Add filtering logic
    if (start_date || end_date) {
        query += ` WHERE 1=1`; // Helper to make appending easier
        if (start_date) {
            query += ` AND timestamp >= ?`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND timestamp <= ?`;
            params.push(end_date);
        }
    }
    
    query += ` ORDER BY id DESC`;

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// 6. START SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Run once immediately on startup so you have data
    fetchWeatherData();
});