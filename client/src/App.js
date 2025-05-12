import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  WiHumidity, WiStrongWind, WiBarometer 
} from 'react-icons/wi';
import { FiSearch, FiClock, FiMapPin, FiThermometer, FiDroplet } from 'react-icons/fi';
import { IoMdSunny, IoMdRainy, IoMdCloudy, IoMdSnow, IoMdThunderstorm } from 'react-icons/io';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('celsius');
  const [history, setHistory] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('weatherSearchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    }
  }, [history]);

  const getWeatherIcon = (iconCode, size = 40) => {
    const iconMap = {
      '01': <IoMdSunny size={size} className="text-yellow-400" />,
      '02': <IoMdCloudy size={size} className="text-gray-400" />,
      '03': <IoMdCloudy size={size} className="text-gray-500" />,
      '04': <IoMdCloudy size={size} className="text-gray-600" />,
      '09': <IoMdRainy size={size} className="text-blue-400" />,
      '10': <IoMdRainy size={size} className="text-blue-500" />,
      '11': <IoMdThunderstorm size={size} className="text-purple-600" />,
      '13': <IoMdSnow size={size} className="text-blue-200" />,
      '50': <IoMdCloudy size={size} className="text-gray-400" />,
    };
    return iconMap[iconCode.substring(0, 2)] || <IoMdSunny size={size} className="text-yellow-400" />;
  };

  const convertTemp = (temp) => {
    if (unit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const fetchWeather = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!city.trim() && !weather?.current?.coord) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/weather?${city ? `city=${city}` : `lat=${weather.current.coord.lat}&lon=${weather.current.coord.lon}`}`
      );
      
      const weatherData = {
        current: {
          ...response.data.current,
          visibility: response.data.current.visibility / 1000
        },
        forecast: response.data.forecast,
        searchedCity: response.data.searchedCity
      };
      
      setWeather(weatherData);
      
      if (city && !history.includes(city)) {
        const newHistory = [city, ...history].slice(0, 5);
        setHistory(newHistory);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, [city, history, weather?.current?.coord]);

  useEffect(() => {
    if (weather?.current?.coord && !city) {
      fetchWeather();
    }
  }, [weather?.current?.coord, city, fetchWeather]);

  const getCurrentLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCity('');
          setWeather(prev => ({
            ...prev,
            current: {
              ...prev?.current,
              coord: {
                lat: position.coords.latitude,
                lon: position.coords.longitude
              }
            }
          }));
        },
        (error) => {
          setError('Geolocation error: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="weather-app-container">
      {/* Header Section */}
      <div className="weather-header">
        <div>
          <h1 className="text-3xl font-bold">Weather Forecast</h1>
          <p className="text-gray-600">
            {weather && new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={getCurrentLocationWeather}
            className="btn"
            disabled={loading}
          >
            <FiMapPin size={18} />
            My Location
          </button>
          
          <button
            onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
            className="btn"
            disabled={loading}
          >
            <FiThermometer size={18} />
            °{unit === 'celsius' ? 'F' : 'C'}
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-container">
        <form onSubmit={fetchWeather}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            <FiSearch size={20} />
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Main Content */}
      {weather && (
        <>
          <div className="weather-main">
            {/* Current Weather */}
            <div className="current-weather">
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {weather.searchedCity}
                  </h2>
                  <p className="text-lg text-gray-600 capitalize">
                    {weather.current.description}
                  </p>
                </div>
                
                <div className="temp-display mt-4">
                  {convertTemp(weather.current.temperature)}°
                  <span className="text-2xl">{unit === 'celsius' ? 'C' : 'F'}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4">
                  {getWeatherIcon(weather.current.icon, 120)}
                </div>
                <p className="text-lg">
                  Feels like: {convertTemp(weather.current.feels_like)}°{unit === 'celsius' ? 'C' : 'F'}
                </p>
              </div>
            </div>

            {/* Weather Forecast */}
            <div className="weather-forecast">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiClock />
                5-Day Forecast
              </h3>
              
              <div>
                {weather.forecast.map((day, index) => (
                  <div key={index} className="forecast-item">
                    <div className="flex items-center gap-3">
                      <span className="font-medium w-24">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className="flex-grow flex justify-center">
                        {getWeatherIcon(day.icon, 30)}
                      </div>
                    </div>
                    <span className="font-semibold">
                      {convertTemp(day.temp)}°{unit === 'celsius' ? 'C' : 'F'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Details */}
            <div className="weather-details">
              <div className="weather-card flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <WiHumidity size={32} />
                </div>
                <div>
                  <p className="text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold">{weather.current.humidity}%</p>
                </div>
              </div>
              
              <div className="weather-card flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <WiStrongWind size={32} />
                </div>
                <div>
                  <p className="text-gray-600">Wind Speed</p>
                  <p className="text-2xl font-bold">{weather.current.wind_speed} m/s</p>
                </div>
              </div>
              
              <div className="weather-card flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <WiBarometer size={32} />
                </div>
                <div>
                  <p className="text-gray-600">Pressure</p>
                  <p className="text-2xl font-bold">{weather.current.pressure} hPa</p>
                </div>
              </div>
              
              <div className="weather-card flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiDroplet size={24} />
                </div>
                <div>
                  <p className="text-gray-600">Visibility</p>
                  <p className="text-2xl font-bold">
                    {weather.current.visibility} km
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search History - 2 Column Grid */}
          <div className="weather-history">
            <h3 className="text-xl font-semibold mb-4">Search History</h3>
            <div className="history-grid">
              {history.map((cityItem, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => {
                    setCity(cityItem);
                    fetchWeather({ preventDefault: () => {} });
                  }}
                >
                  <p className="history-city">{cityItem}</p>
                  <FiSearch className="history-icon" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;