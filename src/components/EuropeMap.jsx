import { useState, useEffect } from "react";
import SvgMap from "./SvgMap";

export function EuropeMap() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY; // API nøgle for vejr api. |


  function clickHandler(event) {
    const targetId = event.target.id;

    // Ignore clicks on the main SVG element
    if (targetId === "svg2") {
      return setSelectedCountry(null);
    }

    // Handle cases where the target ID is longer than 2 characters
    if (targetId.length > 2) {
      const parentElement = event.target.parentElement;

      // Check if the parent element has a valid country ID
      if (parentElement?.id.length === 2) {
        setSelectedCountry(parentElement);
      }
      return;
    }

    // Set the selected country directly if the target ID is valid
    setSelectedCountry(event.target);
  }

  function fetchCountryData(countryId) {

    fetch("https://restcountries.com/v3.1/alpha/" + countryId.toLowerCase())
      .then((response) => response.json())
      .then((data) => setCountryInfo(data[0]))
      .catch((error) => console.error("Error fetching country data:", error));
  }

  useEffect(() => {
    // check that a country was selected, and then color it and fetch the data
    const countryId = selectedCountry?.id;
    if (countryId) {
      selectedCountry.style.fill = "red";
      fetchCountryData(selectedCountry.id);
    }
    // reset the fill color on unload
    return () => {
      if (countryId) {
        selectedCountry.style.fill = "silver";
      }
    };
  }, [selectedCountry]);

  useEffect(() => {
    if (countryInfo!=null) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${countryInfo.capital}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .then(data => setWeatherInfo(data))
        .catch(error => console.error("Error fetching from Weather API", error));
    }
  },[countryInfo]);



  return (
    <>
      <div onClick={clickHandler}>
        <SvgMap style={{
          cursor: "pointer",
          backgroundColor: "#eef2f5",
          width: "100%",
          height: "100%",
        }} />
      </div>
      <CountryInfo countryInfo={countryInfo} />
      { countryInfo && <WeatherInfo weatherInfo={weatherInfo} /> }
    </>
  );
}

export function CountryInfo({ countryInfo }) {
  if (countryInfo == null) {
    return <div>Please select a country by clicking on the map.</div>;
  }
  let currency = Object.values(countryInfo.currencies)[0].name;
  return (
    <div>
      <h2>
        {countryInfo.flag} {countryInfo.name.common} details
      </h2>
      <ul>
        <li>Population: {countryInfo.population}</li>
        <li>Area: {countryInfo.area}</li>
        <li>Currency: {currency}</li>
        <li>Capital: {countryInfo.capital?.[0]}</li>
      </ul>
      
    </div>
  );
}

export function WeatherInfo({ weatherInfo }) {
    if (weatherInfo==null) {
        return <p>Loading weather info</p>;
    }
    return (
        <div>
            <h3>Vejret i {weatherInfo.name}</h3>
            <p>
                <strong>Temperatur:</strong> {weatherInfo.main.temp}
            </p>
            <p>
                <strong>Beskrivelse:</strong> {weatherInfo.weather[0].description}
            </p>
            <img
            src={`https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`}
            alt={weatherInfo.weather[0].description}
          />
        </div>
    );
}