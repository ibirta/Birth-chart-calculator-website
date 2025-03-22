import React from 'react';
import axios from 'axios';

const GetBirthChart = () => {
  const sendBirthData = async () => {
    const response = await axios.post('http://localhost:5000/birthchart', {
      year: 1997,
      month: 9,
      day: 24,
      hour: 6,
      minute: 41,
    });
    console.log(response.data);
  };

  return <button onClick={sendBirthData}>Send Birth Data</button>;
};

export default GetBirthChart;