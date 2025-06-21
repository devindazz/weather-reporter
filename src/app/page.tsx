"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Thermometer, Droplets, Wind, Sun, MapPin, Cloud, CloudRain, CloudSnow, Zap } from "lucide-react"

interface WeatherData {
  name: string
  main: {
    temp: number
    humidity: number
    feels_like?: number
    temp_min?: number
    temp_max?: number
  }
  wind: {
    speed: number
  }
  uv?: number
  weather: Array<{
    main: string
    description: string
    icon?: string
  }>
}

export default function WeatherReporter() {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [isUserLocation, setIsUserLocation] = useState(false)

 
  const MIN_LOADING_TIME = 2000 

  const fetchWeather = async (cityName: string) => {
    setLoading(true)
    setError("")

    const startTime = Date.now()

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      setWeatherData(data)
      setIsUserLocation(false)
    } catch (err) {
      // Also apply minimum loading time for errors
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      setError(err instanceof Error ? err.message : "An error occurred")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
    setLocationLoading(true)
    setError("")

    const startTime = Date.now()

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      setWeatherData(data)
      setIsUserLocation(true)
    } catch (err) {
      //  apply minimum loading time for errors
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime))
      }

      setError(err instanceof Error ? err.message : "An error occurred")
      setWeatherData(null)
    } finally {
      setLocationLoading(false)
    }
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeatherByCoordinates(latitude, longitude)
      },
      (error) => {
        setLocationLoading(false)

        if (error.code === error.PERMISSION_DENIED) {
          setError("Location access denied. Please allow location access and try again.")
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setError("Location information is unavailable.")
        } else if (error.code === error.TIMEOUT) {
          setError("Location request timed out.")
        } else {
          setError("An error occurred while retrieving location.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  useEffect(() => {
    fetchWeather("Colombo, Sri Lanka")
  }, [])

  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name")
      return
    }

    await fetchWeather(city)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchWeather()
  }

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain?.toLowerCase()) {
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "clouds":
        return <Cloud className="w-8 h-8 text-gray-500" />
      case "rain":
      case "drizzle":
        return <CloudRain className="w-8 h-8 text-blue-500" />
      case "snow":
        return <CloudSnow className="w-8 h-8 text-blue-300" />
      case "thunderstorm":
        return <Zap className="w-8 h-8 text-purple-500" />
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getBackgroundGradient = () => {
    if (!weatherData?.weather?.[0]) return "from-blue-400 to-blue-300"

    const weatherMain = weatherData.weather[0].main.toLowerCase()
    const hour = new Date().getHours()
    const isNight = hour < 6 || hour > 18

    if (isNight) {
      return "from-indigo-900 via-purple-900 to-pink-800"
    }

    switch (weatherMain) {
      case "clear":
        return "from-yellow-400 via-orange-400 to-red-400"
      case "clouds":
        return "from-gray-400 via-gray-500 to-gray-600"
      case "rain":
      case "drizzle":
        return "from-blue-500 via-blue-600 to-indigo-700"
      case "snow":
        return "from-blue-200 via-blue-300 to-blue-400"
      case "thunderstorm":
        return "from-purple-600 via-purple-700 to-indigo-800"
      default:
        return "from-blue-400 to-blue-600"
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000`}>
   
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 bg-white/5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 p-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8 pt-8">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Weather Reporter</h1>
            <p className="text-white/80 text-lg">Your personal weather companion</p>
          </div>

          {/* Search Section */}
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-6 shadow-2xl border border-white/30">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Search for any city..."
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-white/50 text-gray-800 placeholder-gray-500 text-lg shadow-lg"
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-white/90 hover:bg-white text-gray-800 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

           
            <div className="text-center">
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MapPin className="w-5 h-5" />
                {locationLoading ? "Getting Location..." : "Use My Location"}
              </button>
              <p className="text-white/80 text-sm mt-3">
                {isUserLocation ? "📍 Your current location" : "📍 Default: Colombo, Sri Lanka"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 backdrop-blur-md border border-red-300/50 text-white rounded-2xl p-4 mb-6 shadow-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {(loading || locationLoading) && !weatherData && (
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Weather Loading Animation */}
                <div className="relative">
                  {/* Spinning Sun */}
                  <div className="animate-spin" style={{ animationDuration: "3s" }}>
                    <Sun className="w-16 h-16 text-yellow-300" />
                  </div>
                  {/* Floating Clouds */}
                  <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDuration: "2s" }}>
                    <Cloud className="w-8 h-8 text-white/60" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 animate-pulse" style={{ animationDuration: "1.5s" }}>
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Loading Text */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {locationLoading ? "Getting Your Location" : "Getting Weather Data"}
                  </h3>
                  <p className="text-white/80">
                    {locationLoading
                      ? "Please wait while we determine your location..."
                      : "Please wait while we fetch the latest weather information..."}
                  </p>
                </div>

                {/* Animated Progress Dots */}
                <div className="flex space-x-2">
                  <div
                    className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "200ms", animationDuration: "1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "400ms", animationDuration: "1s" }}
                  ></div>
                </div>

                {/* Weather Cards Skeleton */}
                <div className="w-full mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="bg-white/10 rounded-2xl p-6 animate-pulse"
                        style={{ animationDuration: `${1.5 + i * 0.2}s` }}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full"></div>
                          <div className="h-4 w-20 bg-white/20 rounded"></div>
                          <div className="h-8 w-16 bg-white/20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weather Data Display */}
          {weatherData && !loading && !locationLoading && (
            <div className="space-y-6">
              {/* City Name Header */}
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2">{weatherData.name}</h2>
                <p className="text-white/90 text-xl capitalize">{weatherData.weather?.[0]?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Main Temperature */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  {weatherData.weather?.[0] && getWeatherIcon(weatherData.weather[0].main)}
                  <p className="text-white/80 text-sm mb-1 mt-3">Current Temperature</p>
                  <p className="text-white text-3xl font-bold">
                    {weatherData.main?.temp ? Math.round(weatherData.main.temp) : "N/A"}°C
                  </p>
                  {weatherData.main.feels_like && (
                    <p className="text-white/60 text-sm mt-1">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
                  )}
                </div>

                {/* Temperature Range */}
                {weatherData.main.temp_min && weatherData.main.temp_max && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <Thermometer className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                    <p className="text-white/80 text-sm mb-1">Temperature Range</p>
                    <p className="text-white text-xl font-bold">
                      {Math.round(weatherData.main.temp_min)}° / {Math.round(weatherData.main.temp_max)}°
                    </p>
                  </div>
                )}

                {/* Humidity */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <Droplets className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                  <p className="text-white/80 text-sm mb-1">Humidity</p>
                  <p className="text-white text-xl font-bold">{weatherData.main.humidity}%</p>
                </div>

                {/* Wind Speed */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <Wind className="w-8 h-8 text-green-300 mx-auto mb-3" />
                  <p className="text-white/80 text-sm mb-1">Wind Speed</p>
                  <p className="text-white text-xl font-bold">{weatherData.wind.speed} m/s</p>
                </div>

                {/* UV Index */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <Sun className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                  <p className="text-white/80 text-sm mb-1">UV Index</p>
                  <p className="text-white text-xl font-bold">{weatherData.uv || "N/A"}</p>
                </div>
              </div>

          
              <div className="text-center text-white/60 text-sm">
                <p>Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
