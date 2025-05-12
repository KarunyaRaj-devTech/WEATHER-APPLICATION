require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get('/api/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    if (!city && !(lat && lon)) {
      return res.status(400).json({ error: 'Either city or lat/lon coordinates are required' });
    }

    const locationQuery = city ? `q=${city}` : `lat=${lat}&lon=${lon}`;
    
    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?${locationQuery}&appid=${API_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?${locationQuery}&appid=${API_KEY}&units=metric`)
    ]);

    const currentWeather = {
      city: currentResponse.data.name,
      country: currentResponse.data.sys.country,
      temperature: currentResponse.data.main.temp,
      feels_like: currentResponse.data.main.feels_like,
      humidity: currentResponse.data.main.humidity,
      wind_speed: currentResponse.data.wind.speed,
      pressure: currentResponse.data.main.pressure,
      visibility: currentResponse.data.visibility,
      description: currentResponse.data.weather[0].description,
      icon: currentResponse.data.weather[0].icon,
      coord: currentResponse.data.coord
    };

    const forecast = forecastResponse.data.list
      .filter((item, index) => index % 8 === 0)
      .map(item => ({
        date: item.dt_txt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));

    res.json({
      current: currentWeather,
      forecast,
      searchedCity: city || `${currentWeather.city} (Your Location)`
    });
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else if (error.response && error.response.status === 401) {
      res.status(401).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Error fetching weather data' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});