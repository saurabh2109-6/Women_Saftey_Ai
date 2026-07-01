import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export const MapPreview: React.FC = () => {
  const { gpsCoords, gpsHistory, volunteers, activeSOS } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the map
    const drawMap = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a'; // Deep slate map bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Road Grid Mockup
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Mock Roads
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = 4;
      
      // Main Road 1
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.35);
      ctx.lineTo(canvas.width, canvas.height * 0.45);
      ctx.stroke();

      // Main Road 2
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.6, 0);
      ctx.lineTo(canvas.width * 0.4, canvas.height);
      ctx.stroke();

      // Side road
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.7);
      ctx.lineTo(canvas.width * 0.45, canvas.height * 0.75);
      ctx.lineTo(canvas.width * 0.55, canvas.height * 0.3);
      ctx.stroke();

      // Draw Unsafe Zones (Danger Areas)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)'; // Transparent Red
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.8, canvas.height * 0.2, 50, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Label Danger Zone
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.font = '9px system-ui, sans-serif';
      ctx.fillText('HIGH CRIME ZONE (NIGHT)', canvas.width * 0.68, canvas.height * 0.15);

      // Safe Zone
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; // Transparent Green
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.2, canvas.height * 0.8, 60, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.fillText('SAFE SHELTER ZONE', canvas.width * 0.08, canvas.height * 0.85);

      // User Coordinates Mapping
      // Scale lat/lng to canvas coordinates
      // Lat range roughly [28.6080, 28.6200]
      // Lng range roughly [77.2000, 77.2180]
      const getCanvasCoords = (lat: number, lng: number) => {
        const xMin = 77.2000;
        const xMax = 77.2180;
        const yMin = 28.6080;
        const yMax = 28.6200;

        const x = ((lng - xMin) / (xMax - xMin)) * canvas.width;
        // Invert Y because canvas 0 is top
        const y = canvas.height - ((lat - yMin) / (yMax - yMin)) * canvas.height;

        return { x, y };
      };

      const userPos = getCanvasCoords(gpsCoords.lat, gpsCoords.lng);

      // Draw GPS History Breadcrumbs during SOS
      if (gpsHistory.length > 1) {
        ctx.strokeStyle = activeSOS ? 'rgba(244, 63, 94, 0.8)' : 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        
        gpsHistory.forEach((pt, idx) => {
          const ptPos = getCanvasCoords(pt.lat, pt.lng);
          if (idx === 0) ctx.moveTo(ptPos.x, ptPos.y);
          else ctx.lineTo(ptPos.x, ptPos.y);
        });
        
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      // Draw Emergency Broadcast Radius
      if (activeSOS) {
        // Red pulsating ripple ring
        const pulseRadius = 30 + (Date.now() % 1000) * 0.04;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(userPos.x, userPos.y, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.beginPath();
        ctx.arc(userPos.x, userPos.y, 45, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Blue scanning circle
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.beginPath();
        ctx.arc(userPos.x, userPos.y, 25, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.stroke();
      }

      // Draw User marker
      ctx.fillStyle = activeSOS ? '#f43f5e' : '#3b82f6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      
      // Draw outer glowing indicator
      ctx.beginPath();
      ctx.arc(userPos.x, userPos.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(userPos.x, userPos.y, 3, 0, 2 * Math.PI);
      ctx.fill();

      // Label User
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.fillText('You (Live GPS)', userPos.x + 12, userPos.y + 3);

      // Draw Volunteers
      volunteers.forEach(v => {
        const vPos = getCanvasCoords(v.lat, v.lng);
        
        // Draw volunteer dot
        ctx.fillStyle = v.accepted ? '#10b981' : '#f59e0b'; // Green if accepted, Yellow if idle
        ctx.beginPath();
        ctx.arc(vPos.x, vPos.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label volunteer
        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px system-ui, sans-serif';
        ctx.fillText(v.name, vPos.x + 10, vPos.y + 3);

        // Draw connection path if they accepted
        if (v.accepted && activeSOS) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(userPos.x, userPos.y);
          ctx.lineTo(vPos.x, vPos.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    let animationId: number;
    const animate = () => {
      drawMap();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gpsCoords, gpsHistory, volunteers, activeSOS]);

  return (
    <div className="map-canvas-container">
      <canvas
        ref={canvasRef}
        width={350}
        height={180}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};
