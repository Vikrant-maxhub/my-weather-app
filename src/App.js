import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  CircularProgress,
  Fade,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  WbSunny, 
  Cloud, 
  WaterDrop, 
  Air, 
  Thermostat,
  Speed,
  LocationOn,
  Favorite,
  FavoriteBorder,
  Refresh,
  Search,
  Visibility,
  Compress,
  NightsStay,
  WbCloudy,
  Thunderstorm,
  Opacity,
  VisibilityOff
} from '@mui/icons-material';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [unit, setUnit] = useState('metric'); // metric or imperial

  const API_KEY = '9f233356b84d7c95e6a617734f5c98d8';

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Unable to get your location. Please enter a city name.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      setError('');
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`)
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setCity(weatherResponse.data.name);
    } catch (err) {
      console.error('API Error:', err);
      setError('Error fetching weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError('');
      
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.data || geoResponse.data.length === 0) {
        throw new Error('City not found');
      }

      const { lat, lon } = geoResponse.data[0];
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`)
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Invalid API key. Please check your API key and make sure it is activated.');
      } else if (err.response?.status === 404) {
        setError('City not found. Please try again.');
      } else {
        setError('Error fetching weather data. Please try again.');
      }
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!weather) return;
    
    const cityKey = `${weather.name},${weather.sys.country}`;
    const isFavorite = favorites.some(fav => fav.key === cityKey);
    
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.key !== cityKey));
    } else {
      setFavorites([...favorites, {
        key: cityKey,
        name: weather.name,
        country: weather.sys.country,
        temp: weather.main.temp,
        description: weather.weather[0].description
      }]);
    }
  };

  const loadFavorite = (favorite) => {
    setCity(favorite.name);
    // Fetch weather for the favorite city
    setTimeout(() => fetchWeather(), 100);
  };

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case 'Clear':
        return <WbSunny sx={{ fontSize: 60, color: '#FFA500' }} />;
      case 'Clouds':
        return <WbCloudy sx={{ fontSize: 60, color: '#666' }} />;
      case 'Rain':
        return <Opacity sx={{ fontSize: 60, color: '#2196F3' }} />;
      case 'Thunderstorm':
        return <Thunderstorm sx={{ fontSize: 60, color: '#FF9800' }} />;
      case 'Snow':
        return <NightsStay sx={{ fontSize: 60, color: '#E3F2FD' }} />;
      default:
        return <Cloud sx={{ fontSize: 60, color: '#666' }} />;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUnitSymbol = () => unit === 'metric' ? '°C' : '°F';

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Weather Dashboard
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '20px'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Enter city name"
              variant="outlined"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />
            <Button 
              variant="contained" 
              onClick={fetchWeather}
              disabled={loading}
              startIcon={<Search />}
              sx={{ minWidth: '120px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
            <Tooltip title="Use current location">
              <IconButton 
                onClick={getCurrentLocation}
                sx={{ color: 'white' }}
              >
                <LocationOn />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              {unit === 'metric' ? '°C' : '°F'}
            </Button>
          </Box>
        </Paper>

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {weather && (
          <Fade in={true}>
            <Box>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h4" gutterBottom>
                        {weather.name}, {weather.sys.country}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {formatDate(weather.dt)} • {formatTime(weather.dt)}
                      </Typography>
                    </Box>
                    <IconButton onClick={toggleFavorite} sx={{ color: '#FF6B6B' }}>
                      {favorites.some(fav => fav.key === `${weather.name},${weather.sys.country}`) 
                        ? <Favorite /> 
                        : <FavoriteBorder />
                      }
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 3,
                    position: 'relative'
                  }}>
                    <Typography variant="h1" component="div">
                      {Math.round(weather.main.temp)}{getUnitSymbol()}
                    </Typography>
                    <Box className="weather-icon" sx={{ ml: 2 }}>
                      {getWeatherIcon(weather.weather[0].main)}
                    </Box>
                  </Box>

                  <Typography variant="h5" gutterBottom sx={{ textTransform: 'capitalize', mb: 3 }}>
                    {weather.weather[0].description}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <WaterDrop color="primary" />
                        <Typography>Humidity</Typography>
                        <Typography variant="h6">{weather.main.humidity}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Air color="primary" />
                        <Typography>Wind</Typography>
                        <Typography variant="h6">{weather.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Thermostat color="primary" />
                        <Typography>Feels like</Typography>
                        <Typography variant="h6">{Math.round(weather.main.feels_like)}{getUnitSymbol()}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Speed color="primary" />
                        <Typography>Pressure</Typography>
                        <Typography variant="h6">{weather.main.pressure} hPa</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Visibility color="primary" />
                        <Typography>Visibility</Typography>
                        <Typography variant="h6">{(weather.visibility / 1000).toFixed(1)} km</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Compress color="primary" />
                        <Typography>Min/Max</Typography>
                        <Typography variant="h6">
                          {Math.round(weather.main.temp_min)}° / {Math.round(weather.main.temp_max)}°
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography>Sunrise</Typography>
                        <Typography variant="h6">{formatTime(weather.sys.sunrise)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography>Sunset</Typography>
                        <Typography variant="h6">{formatTime(weather.sys.sunset)}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {forecast && (
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      5-Day Forecast
                    </Typography>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                        <Tab label="Daily" />
                        <Tab label="Hourly" />
                      </Tabs>
                    </Box>
                    
                    {currentTab === 0 && (
                      <Grid container spacing={2}>
                        {forecast.list.filter((item, index) => index % 8 === 0).slice(0, 5).map((item, index) => (
                          <Grid item xs={12} sm={6} md={2.4} key={index}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="h6">{formatDate(item.dt)}</Typography>
                              {getWeatherIcon(item.weather[0].main)}
                              <Typography variant="h6">{Math.round(item.main.temp)}{getUnitSymbol()}</Typography>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {item.weather[0].description}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    
                    {currentTab === 1 && (
                      <Grid container spacing={1}>
                        {forecast.list.slice(0, 8).map((item, index) => (
                          <Grid item xs={6} sm={3} md={1.5} key={index}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="body2">{formatTime(item.dt)}</Typography>
                              {getWeatherIcon(item.weather[0].main)}
                              <Typography variant="body2">{Math.round(item.main.temp)}{getUnitSymbol()}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Fade>
        )}

        {favorites.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Favorite Cities
              </Typography>
              <Grid container spacing={2}>
                {favorites.map((favorite, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Chip
                      label={`${favorite.name}, ${favorite.country} - ${Math.round(favorite.temp)}${getUnitSymbol()}`}
                      onClick={() => loadFavorite(favorite)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

export default App;
