import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GasPressureGame = () => {
  const [particles, setParticles] = useState(5);
  const [pressure, setPressure] = useState(0);
  const [temperature, setTemperature] = useState(300); // in Kelvin
  const [collisions, setCollisions] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const MAX_SAFE_PRESSURE = 150; // kPa
  const DANGER_PRESSURE = 200; // kPa

  useEffect(() => {
    const newPressure = calculatePressure();
    setPressure(newPressure);

    if (newPressure > DANGER_PRESSURE) {
      setGameState('exploded');
    } else if (newPressure < 50) {
      setGameState('collapsed');
    } else {
      setGameState('playing');
    }
  }, [particles, temperature, collisions]);

  useEffect(() => {
    initializeParticles();
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [particles, temperature]);

  const calculatePressure = () => {
    // Simplified pressure calculation based on ideal gas law
    return (particles * temperature * 0.08) + (collisions * 0.005);
  };

  const initializeParticles = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    particlesRef.current = Array.from({ length: particles }, () => ({
      x: Math.random() * containerRect.width,
      y: Math.random() * containerRect.height,
      vx: getRandomVelocity(),
      vy: getRandomVelocity(),
    }));
  };

  const getRandomVelocity = () => {
    const baseVelocity = Math.sqrt(temperature / 100);
    return (Math.random() - 0.5) * baseVelocity * 2;
  };

  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      moveParticles(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  const moveParticles = (deltaTime) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newCollisions = 0;

    particlesRef.current.forEach(particle => {
      particle.x += particle.vx * deltaTime * 0.1;
      particle.y += particle.vy * deltaTime * 0.1;

      if (particle.x <= 0 || particle.x >= containerRect.width) {
        particle.vx *= -1;
        newCollisions++;
      }
      if (particle.y <= 0 || particle.y >= containerRect.height) {
        particle.vy *= -1;
        newCollisions++;
      }
    });

    setCollisions(prev => prev + newCollisions);
  };

  const handleAddParticle = () => {
    setParticles(prev => prev + 1);
    setCollisions(0);  // Reset collisions when adding particles
  };

  const handleRemoveParticle = () => {
    setParticles(prev => Math.max(1, prev - 1));
    setCollisions(0);  // Reset collisions when removing particles
  };

  const handleTemperatureChange = (e) => {
    setTemperature(Number(e.target.value));
    setCollisions(0);  // Reset collisions when changing temperature
  };

  const resetGame = () => {
    setParticles(5);
    setTemperature(300);
    setCollisions(0);
    setGameState('playing');
  };

  const getPressureColor = () => {
    if (pressure > MAX_SAFE_PRESSURE) return 'bg-red-500';
    if (pressure > MAX_SAFE_PRESSURE * 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Gas Pressure and Temperature Simulation</h1>
      <div className="mb-4">
        <p>Particles: {particles}</p>
        <p>Temperature: {temperature} K</p>
        <p>Pressure: {pressure.toFixed(2)} kPa</p>
        <p>Collisions: {collisions}</p>
      </div>
      <div className="mb-4">
        <div className="w-full h-4 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getPressureColor()}`} 
            style={{ width: `${Math.min((pressure / DANGER_PRESSURE) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-center mt-1">Pressure Gauge</p>
      </div>
      <div className="mb-4">
        <button 
          onClick={handleAddParticle}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          disabled={gameState !== 'playing'}
        >
          Add Particle
        </button>
        <button 
          onClick={handleRemoveParticle}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={gameState !== 'playing' || particles <= 1}
        >
          Remove Particle
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="temperature" className="block">Temperature (K): </label>
        <input
          type="range"
          id="temperature"
          min="100"
          max="1000"
          value={temperature}
          onChange={handleTemperatureChange}
          className="w-full"
          disabled={gameState !== 'playing'}
        />
      </div>
      <div 
        ref={containerRef}
        className="w-full h-40 bg-white border-2 border-gray-300 rounded relative overflow-hidden"
      >
        {particlesRef.current.map((particle, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
            }}
          />
        ))}
      </div>
      {gameState === 'exploded' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Container Exploded!</AlertTitle>
          <AlertDescription>
            The pressure exceeded 200 kPa. The container exploded.
          </AlertDescription>
        </Alert>
      )}
      {gameState === 'collapsed' && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Container Collapsed!</AlertTitle>
          <AlertDescription>
            The pressure fell below 50 kPa. The container collapsed.
          </AlertDescription>
        </Alert>
      )}
      {gameState !== 'playing' && (
        <button 
          onClick={resetGame}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Reset Game
        </button>
      )}
    </div>
  );
};

export default GasPressureGame;
