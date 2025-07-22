import { use, useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}


export default function App() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  useEffect(
    function () {
      if (!location) return;
      setIsLoading(true);
      async function getWeather() {
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
          );
          const geoData = await geoRes.json();
          console.log(geoData);

          if (!geoData.results || geoData.results.length === 0) throw new Error("Location not found");

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results[0];
          console.log(latitude, longitude, timezone, name, country_code);

          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );

          const weatherData = await weatherRes.json();
          // console.log(weatherData.daily);
          // setWeather(weatherData.daily);
          console.log(weatherData.daily);
          setWeather(weatherData.daily);
          console.log(weather);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
      getWeather();
    },
    [location]
  );
  return (
    <div>
      
      <Main location={location} setLocation={setLocation} weather={weather} isLoading= {isLoading} />
    </div>
  );
}

function Main({ location, setLocation, weather, isLoading }) {
  return (
    <div className="main">
      <h1>Weather in {location}</h1>
      <input
        type="text"
        placeholder="Search weather....."
        onChange={(e) => setLocation(e.target.value)}
      />
      {isLoading && <p className="loader">Loading.....</p>}
      {weather && <Days weather={weather} />}
      {/* <Days weather = {weather} /> */}
    </div>
  );
}

function Days({ weather }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather;
  return (
    <div className="weather">
      {dates.map((date, i) => (
        <Day max={max[i]} min={min[i]} days={date} code={codes[i]} />
      ))}
    </div>
  );
}

function Day({ max, min, days, code }) {
  return (
    <div className="weather-days">
      <span>{getWeatherIcon(code)}</span>
      <p>{formatDay(days)}</p>
      <p>{Math.floor(min)}&deg; &mdash; <strong>{Math.ceil(max)}&mdash;</strong></p>
    </div>
  );
}
