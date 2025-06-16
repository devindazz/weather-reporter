"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Thermometer, Droplets, Wind, Sun, MapPin } from "lucide-react"

interface WeatherData {
  name: string
  main: {
    temp: number
    humidity: number
  }
  wind: {
    speed: number
  }
  uv?: number
  weather: Array<{
    main: string
    description: string
  }>
}

export default function WeatherReporter() {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [isUserLocation, setIsUserLocation] = useState(false)

  const fetchWeather = async (cityName: string) => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      setWeatherData(data)
      setIsUserLocation(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCoordinates = async (lat: number, lon: number) => {
    setLocationLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data")
      }

      setWeatherData(data)
      setIsUserLocation(true)
    } catch (err) {
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
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  // Load Colombo weather by default on component mount
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

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">Weather Reporter</h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 text-white px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Get My Location Button */}
        <div className="mb-6 text-center">
          <button
            onClick={getUserLocation}
            disabled={locationLoading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <MapPin className="w-4 h-4" />
            {locationLoading ? "Getting Location..." : "Get My Location"}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {isUserLocation ? "📍 Showing weather for your location" : "📍 Showing weather for Colombo, Sri Lanka"}
          </p>
        </div>

        {/* Error Message */}
        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

        {/* Loading State */}
        {loading && !weatherData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weather Data Display */}
        {weatherData && !loading && (
          <div className="bg-gray-700 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-950">Weather in {weatherData.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature */}
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <Thermometer className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(weatherData.main.temp)}°C</p>
                </div>
              </div>

              {/* Humidity */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Droplets className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold text-gray-800">{weatherData.main.humidity}%</p>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Wind className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Wind Speed</p>
                  <p className="text-2xl font-bold text-gray-800">{weatherData.wind.speed} m/s</p>
                </div>
              </div>

              {/* UV Index */}
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                <Sun className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">UV Index</p>
                  <p className="text-2xl font-bold text-gray-800">{weatherData.uv || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Weather Description */}
            {weatherData.weather && weatherData.weather[0] && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Conditions</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{weatherData.weather[0].description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
