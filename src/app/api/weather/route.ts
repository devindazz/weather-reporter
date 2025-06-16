import { type NextRequest, NextResponse } from "next/server"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: "City name or coordinates (lat, lon) are required" }, { status: 400 })
  }

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 })
  }

  try {
    let weatherUrl: string

    if (lat && lon) {
      // Use coordinates for weather data
      weatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    } else {
      // Use city name for weather data
      weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city!)}&appid=${OPENWEATHER_API_KEY}&units=metric`
    }

    // Get current weather data
    const weatherResponse = await fetch(weatherUrl)

    if (!weatherResponse.ok) {
      if (weatherResponse.status === 404) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 })
      }
      throw new Error("Failed to fetch weather data")
    }

    const weatherData = await weatherResponse.json()

    // Get UV Index data using coordinates
    let uvIndex = null
    try {
      const uvResponse = await fetch(
        `${BASE_URL}/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${OPENWEATHER_API_KEY}`,
      )
      if (uvResponse.ok) {
        const uvData = await uvResponse.json()
        uvIndex = Math.round(uvData.value)
      }
    } catch (error) {
      console.warn("Failed to fetch UV index:", error)
    }

    // Format the response
    const formattedData = {
      name: weatherData.name,
      main: {
        temp: weatherData.main.temp,
        humidity: weatherData.main.humidity,
      },
      wind: {
        speed: weatherData.wind.speed,
      },
      weather: weatherData.weather,
      uv: uvIndex,
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
