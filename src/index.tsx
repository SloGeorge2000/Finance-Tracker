import React from 'react';
import ReactDOM from 'react-dom';
import App from './pages/App';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, TimeScale } from 'chart.js';
import './index.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, TimeScale);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);