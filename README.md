# Weather Data Logger API

## Project Overview
A Node.js RESTful API that automatically fetches and logs weather data for a specific location every hour. It uses **Express** for the API, **node-cron** for scheduling, and **SQLite** for data storage. This project demonstrates backend skills including external API integration, scheduled background tasks, and persistent data management.

## Features
* **Automated Logging:** Fetches weather data from OpenWeatherMap every hour.
* **Data Persistence:** Stores temperature, humidity, and descriptions in a local SQLite database.
* **REST API:** Provides endpoints to retrieve the latest weather and historical data.
* **Security:** Manages sensitive API keys using environment variables.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite3
* **Scheduler:** node-cron
* **HTTP Client:** Axios

## Prerequisites
* Node.js installed on your system.
* A free API Key from [OpenWeatherMap](https://openweathermap.org/).

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd weather-api-node
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    * Create a file named `.env` in the root folder.
    * Add the following variables:
    ```ini
    WEATHER_API_KEY=your_openweathermap_api_key
    WEATHER_CITY=Hyderabad  <-- Replace this with your preferred city
    PORT=3000
    ```
    * *Note: `WEATHER_CITY` must be a specific city name (e.g., "Mumbai", "New York"), not a country.*

4.  **Run the Server:**
    ```bash
    node server.js
    ```
    * The server will start at `http://localhost:3000`.
    * The first weather log will be fetched immediately upon startup.

## API Documentation

### 1. Get Current Weather
Retrieves the most recently logged weather snapshot.

* **URL:** `/weather/current`
* **Method:** `GET`
* **Success Response:**
    ```json
    {
        "id": 1,
        "location": "London",
        "temperature": 15.5,
        "humidity": 82,
        "description": "broken clouds",
        "timestamp": "2025-12-18 10:30:00"
    }
    ```

### 2. Get Weather History
Retrieves a list of all logged weather data. Supports filtering by date.

* **URL:** `/weather/history`
* **Method:** `GET`
* **Query Parameters (Optional):**
    * `start_date`: Filter logs after this date (Format: YYYY-MM-DD HH:MM:SS)
    * `end_date`: Filter logs before this date.
* **Example Request:**
    `/weather/history?start_date=2025-12-18 09:00:00`
* **Success Response:**
    ```json
    [
        {
            "id": 2,
            "location": "London",
            "temperature": 16.0,
            ...
        },
        {
            "id": 1,
            "location": "London",
            "temperature": 15.5,
            ...
        }
    ]
    ```

## Project Structure
* `server.js`: Main application entry point containing API routes, database logic, and the scheduler.
* `weather.db`: SQLite database file (auto-generated).
* `.env`: Environment variables (excluded from version control).