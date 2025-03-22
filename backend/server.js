const express = require("express");
const swisseph = require("swisseph");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/calculate", (req, res) => {
  const { year, month, day, hour, minute, latitude, longitude } = req.body;

  // Calculate Julian Day
  swisseph.swe_julday(
    year,
    month,
    day,
    hour + minute / 60,
    swisseph.SE_GREG_CAL,
    (julday) => {
      const planets = {
        Sun: swisseph.SE_SUN,
        Moon: swisseph.SE_MOON,
        Mercury: swisseph.SE_MERCURY,
        Venus: swisseph.SE_VENUS,
        Mars: swisseph.SE_MARS,
        Jupiter: swisseph.SE_JUPITER,
        Saturn: swisseph.SE_SATURN,
        Uranus: swisseph.SE_URANUS,
        Neptune: swisseph.SE_NEPTUNE,
        Pluto: swisseph.SE_PLUTO,
      };

      let planetPositions = {};

      // Function to get planetary positions
      const getPlanetPosition = (planet) => {
        return new Promise((resolve) => {
          swisseph.swe_calc_ut(julday, planet, swisseph.SEFLG_SPEED, (data) => {
            resolve({
              position: data.longitude.toFixed(2),
              sign: getZodiacSign(data.longitude),
            });
          });
        });
      };

      // Fetch all planets
      const planetPromises = Object.entries(planets).map(([name, code]) => {
        return getPlanetPosition(code).then((position) => {
          planetPositions[name] = position;
        });
      });

      // Fetch the Rising Sign (Ascendant) using SE_ECL_NUT to avoid calculation errors
      const risingSignPromise = new Promise((resolve) => {
        swisseph.swe_houses(julday, swisseph.SE_ECL_NUT, latitude, longitude, "P", (housesData) => {
          const ascendant = housesData.ascendant.toFixed(2);
          resolve({
            position: ascendant,
            sign: getZodiacSign(ascendant),
          });
        });
      });

      // Fetch all houses
      const housesPromise = new Promise((resolve) => {
        swisseph.swe_houses(julday, swisseph.SE_ECL_NUT, latitude, longitude, "P", (housesData) => {
          const houses = housesData.house.map((h, index) => ({
            house: index + 1,
            position: h.toFixed(2),
            sign: getZodiacSign(h),
          }));
          resolve(houses);
        });
      });

      // Wait for all calculations and send response
      Promise.all([...planetPromises, risingSignPromise, housesPromise]).then((results) => {
        const risingSign = results[results.length - 2]; // Second last resolved promise is Rising Sign
        const houses = results[results.length - 1]; // Last resolved promise is Houses

        res.json({
          planets: planetPositions,
          sunSign: planetPositions.Sun.sign,
          moonSign: planetPositions.Moon.sign,
          risingSign: risingSign.sign, 
          houses: houses, 
        });
      });
    }
  );
});

// Function to determine the zodiac sign from degrees
const getZodiacSign = (degree) => {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  return signs[Math.floor(degree / 30)];
};

const PORT = 5000;
app.listen(PORT, () => console.log(`🌟 Backend running on port ${PORT}`));
