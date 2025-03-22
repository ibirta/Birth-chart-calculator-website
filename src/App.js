// import { useState } from "react";

// const BirthChartCalculator = () => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   const fetchBirthChart = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/calculate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           year: 1996,
//           month: 5,
//           day: 20,
//           hour: 14,
//           minute: 30,
//           latitude: 55.6761,
//           longitude: 12.5683
//         }),
//       });

//       const result = await response.json();
//       setData(result);
//     } catch (err) {
//       setError("Error fetching birth chart.");
//     }
//   };

//   return (
//     <div>
//       <h2>Birth Chart Calculator</h2>
//       <button onClick={fetchBirthChart}>Get Birth Chart</button>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data && (
//         <div>
//           <h3>Sun Sign: {data.sunSign}</h3>
//           <h3>Moon Sign: {data.moonSign}</h3>
//           <h3>Rising Sign: {data.risingSign}</h3>
//           <h3>Houses</h3>
//           <ul>
//             {data.houses.map((house) => (
//               <li key={house.house}>
//                 <strong>House {house.house}:</strong> {house.position}° ({house.sign})
//               </li>
//             ))}
//           </ul>
//           <h3>Planetary Positions:</h3>
//           <ul>
//             {Object.entries(data.planets || {}).map(([planet, details]) => (
//               <li key={planet}>
//                 {planet}: {details.position}° in {details.sign}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BirthChartCalculator;
import { useState } from "react";

const BirthChartCalculator = () => {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    town: "",
  });

  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.targfet.name]: e.target.value });
  };

  // Convert town to latitude and longitude
  const fetchCoordinates = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${formData.town}`
      );
      const result = await response.json();
      
      if (result.length > 0) {
        setCoordinates({ latitude: result[0].lat, longitude: result[0].lon });
        return { latitude: result[0].lat, longitude: result[0].lon };
      } else {
        throw new Error("Location not found");
      }
    } catch (err) {
      setError("Error fetching location coordinates.");
      return null;
    }
  };

  // Fetch birth chart
  const fetchBirthChart = async () => {
    const coords = await fetchCoordinates();
    if (!coords) return;

    try {
      const response = await fetch("http://localhost:5000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: parseInt(formData.year),
          month: parseInt(formData.month),
          day: parseInt(formData.day),
          hour: parseInt(formData.hour),
          minute: parseInt(formData.minute),
          latitude: parseFloat(coords.latitude),
          longitude: parseFloat(coords.longitude),
        }),
      });

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Error fetching birth chart.");
    }
  };

  return (
    <div>
      <h2>Birth Chart Calculator</h2>

      <label>Date of Birth:</label>
      <input type="number" name="year" placeholder="Year" onChange={handleChange} />
      <input type="number" name="month" placeholder="Month" onChange={handleChange} />
      <input type="number" name="day" placeholder="Day" onChange={handleChange} />

      <label>Time of Birth:</label>
      <input type="number" name="hour" placeholder="Hour (0-23)" onChange={handleChange} />
      <input type="number" name="minute" placeholder="Minute (0-59)" onChange={handleChange} />

      <label>Town of Birth:</label>
      <input type="text" name="town" placeholder="Enter town" onChange={handleChange} />

      <button onClick={fetchBirthChart}>Get Birth Chart</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h3>Sun Sign: {data.sunSign}</h3>
          <h3>Moon Sign: {data.moonSign}</h3>
          <h3>Rising Sign: {data.risingSign}</h3>

          <h3>Houses</h3>
          <ul>
            {data.houses.map((house) => (
              <li key={house.house}>
                <strong>House {house.house}:</strong> {house.position}° ({house.sign})
              </li>
            ))}
          </ul>

          <h3>Planetary Positions:</h3>
          <ul>
            {Object.entries(data.planets || {}).map(([planet, details]) => (
              <li key={planet}>
                {planet}: {details.position}° in {details.sign}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BirthChartCalculator;
