import React, { useState } from 'react';
import PredictionForm, { PredictionInput } from '../components/PredictionForm';
import PredictionChart from '../components/PredictionChart';

const App: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionInput | null>(null);

  return (
    <div>
      <h1 className="app-title">Future Savings Predictor</h1>
      <PredictionForm onSubmit={setPrediction} />
      {prediction && <PredictionChart input={prediction} />}
    </div>
  );
};

export default App;
