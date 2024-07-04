import React from 'react';
import GasPressureGame from '../components/GasPressureGame';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Gas Pressure Simulation</h1>
      <GasPressureGame />
    </div>
  );
};

export default Home;
