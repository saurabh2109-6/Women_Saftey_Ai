import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
export const MotionSensorHandler: React.FC = () => {
  const {
    simulateSignal,
    shakeThreshold,
    fallThreshold,
    triggerSOS,
    activeSOS,
    addLog,
    user
  } = useApp();

  const [, setSensorAvailable] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const shakeCountRef = useRef(0);
  const lastShakeTimeRef = useRef(0);
  const lastAccelerometerRef = useRef({ x: 0, y: 0, z: 0 });
  const fallPhaseRef = useRef<'none' | 'freefall' | 'impact'>('none');
  const fallTimeRef = useRef(0);

  useEffect(() => {
    // Check if device orientation/motion is available
    if (window.DeviceMotionEvent) {
      setSensorAvailable(true);
      // Auto-start listening on mount if user is logged in
      if (user) {
        startMotionTracking();
      }
    }

    return () => {
      stopMotionTracking();
    };
  }, [user]);

  const startMotionTracking = async () => {
    try {
      // Handle iOS 13+ permission request if needed
      const DeviceMotionEventClass = (window as any).DeviceMotionEvent;
      if (typeof DeviceMotionEventClass.requestPermission === 'function') {
        const permission = await DeviceMotionEventClass.requestPermission();
        if (permission === 'granted') {
          registerEvents();
        } else {
          addLog('Motion sensors permission denied. Relying on simulator controls.');
        }
      } else {
        registerEvents();
      }
    } catch (e) {
      // Permission UI not supported, register normally
      registerEvents();
    }
  };

  const registerEvents = () => {
    window.addEventListener('devicemotion', handleMotion);
    setIsMonitoring(true);
    addLog('Motion sensors active. Monitoring for falls and shake gestures.');
  };

  const stopMotionTracking = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setIsMonitoring(false);
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const accel = event.accelerationIncludingGravity || event.acceleration;
    if (!accel) return;

    const x = accel.x || 0;
    const y = accel.y || 0;
    const z = accel.z || 0;

    const last = lastAccelerometerRef.current;
    const deltaX = Math.abs(x - last.x);
    const deltaY = Math.abs(y - last.y);
    const deltaZ = Math.abs(z - last.z);

    lastAccelerometerRef.current = { x, y, z };

    // 1. SHAKE GESTURES DETECTION
    // Calculate magnitude of acceleration change
    const diffMag = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    // Scale shake sensitivity (e.g. threshold 50 -> diffMag required: 15)
    const requiredDiff = Math.max(25 - (shakeThreshold * 0.2), 6);

    const now = Date.now();
    if (diffMag > requiredDiff) {
      // Debounce and increment shake count
      if (now - lastShakeTimeRef.current > 200) {
        shakeCountRef.current += 1;
        lastShakeTimeRef.current = now;
        
        // Log shake registered
        if (shakeCountRef.current === 1) {
          simulateSignal('shake', true);
        }

        // If user shakes 4 times in 2.5 seconds, trigger emergency
        if (shakeCountRef.current >= 4 && !activeSOS) {
          addLog(`Device Shake: Rapid movement detected (Shook ${shakeCountRef.current} times).`);
          triggerSOS('Shake-to-SOS Gesture');
          shakeCountRef.current = 0;
          simulateSignal('shake', false);
        }
      }
    }

    // Reset shake count after 2.5 seconds of inactivity
    if (now - lastShakeTimeRef.current > 2500 && shakeCountRef.current > 0) {
      shakeCountRef.current = 0;
      simulateSignal('shake', false);
    }

    // 2. SUDDEN FALL DETECTION
    // Total instantaneous acceleration vector including gravity
    const totalAccel = Math.sqrt(x*x + y*y + z*z);
    
    // Normal gravity is ~9.8 m/s^2.
    // Freefall phase: acceleration falls near 0 (weightlessness).
    const freefallLimit = Math.max(3 - (fallThreshold * 0.02), 1.5); // ~2 m/s^2
    const impactLimit = Math.min(20 + (fallThreshold * 0.1), 32); // ~2.5g impact (~25 m/s^2)

    if (fallPhaseRef.current === 'none' && totalAccel < freefallLimit) {
      // Weightlessness detected
      fallPhaseRef.current = 'freefall';
      fallTimeRef.current = now;
    } else if (fallPhaseRef.current === 'freefall') {
      const timeInFreefall = now - fallTimeRef.current;
      
      if (timeInFreefall > 500) {
        // Freefall lasted too long to be a normal drop, reset
        fallPhaseRef.current = 'none';
      } else if (totalAccel > impactLimit) {
        // High impact detected after freefall
        fallPhaseRef.current = 'impact';
        fallTimeRef.current = now;
        addLog(`AI Sensor Engine: Heavy impact detected post freefall. Waiting for stillness...`);
      }
    } else if (fallPhaseRef.current === 'impact') {
      const timeSinceImpact = now - fallTimeRef.current;
      
      // Look for stillness (relative immobility) in the next 1.5 seconds
      if (timeSinceImpact > 1500) {
        // Stillness check passed - confirm fall
        if (diffMag < 2 && !activeSOS) {
          addLog('AI Sensor Engine: Sudden fall verified (Freefall -> Impact -> Immobility).');
          simulateSignal('fall', true);
          triggerSOS('Fall Detection Engine');
          
          setTimeout(() => {
            simulateSignal('fall', false);
          }, 5000);
        }
        fallPhaseRef.current = 'none';
      } else if (diffMag > 15) {
        // Active movement immediately after impact means user is probably fine, cancel
        fallPhaseRef.current = 'none';
      }
    }
  };

  return (
    <div style={{ display: 'none' }}>
      {/* Hidden sensor controller - handles events in background */}
      <span data-sensor-active={isMonitoring.toString()}></span>
    </div>
  );
};
