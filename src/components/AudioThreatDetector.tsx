import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, MicOff, AlertTriangle } from 'lucide-react';

export const AudioThreatDetector: React.FC = () => {
  const {
    signals,
    simulateSignal,
    audioSensitivity,
    voiceKeywords,
    addLog,
    activeSOS,
    user
  } = useApp();

  const [, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isListening, setIsListening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can handle Hindi/English mixed expressions

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const text = event.results[lastResultIndex][0].transcript.toLowerCase();
        
        // Log transcription
        if (event.results[lastResultIndex].isFinal) {
          addLog(`Voice detected: "${text.trim()}"`);
          
          // Check for keywords
          const matched = voiceKeywords.some(keyword => text.includes(keyword.toLowerCase()));
          if (matched) {
            addLog(`KEYWORD MATCHED: Secret Code word detected in voice stream.`);
            simulateSignal('wordMatch', true);
            // Auto turn off signal after a delay
            setTimeout(() => {
              simulateSignal('wordMatch', false);
            }, 6000);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.error('Speech recognition error:', e.error);
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // ignore active session errors
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [voiceKeywords, isListening]);

  // Start audio analyzer
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicPermission('granted');
      setIsListening(true);
      addLog('Microphone permission granted. AI audio threat analysis active.');

      // Setup Web Audio
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start canvas visualization
      visualize();

      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          // already running
        }
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      setMicPermission('denied');
      setIsListening(false);
      addLog('Microphone permission denied. Relying on simulator controls.');
    }
  };

  const stopMic = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    addLog('AI audio threat analyzer paused.');
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isListening) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = '#131a2c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wave
      ctx.lineWidth = 2;
      ctx.strokeStyle = signals.scream ? '#f43f5e' : '#10b981';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      // Calculate average volume to check for screams
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // Normalized -1.0 to 1.0 around zero (128)
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;

        // Scream detection logic: distance from baseline (128)
        const deviation = Math.abs(dataArray[i] - 128);
        sum += deviation * deviation;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      const rms = Math.sqrt(sum / bufferLength);
      // Volume score out of 100
      const currentVolume = Math.min((rms / 64) * 100, 100);

      // Threshold is based on sensitivity: lower sensitivity = higher threshold
      // For instance, sensitivity 65 -> threshold volume of 100 - 65 = 35
      const screamThreshold = Math.max(100 - audioSensitivity, 15);

      if (currentVolume > screamThreshold && user && !activeSOS) {
        simulateSignal('scream', true);
        addLog(`AI Scream Engine: Threat volume detected (${currentVolume.toFixed(0)}%) above sensitivity threshold.`);
        
        // Automatically lower screaming state after 3 seconds of silence
        const timer = setTimeout(() => {
          simulateSignal('scream', false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    draw();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div style={{ marginTop: '14px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isListening ? (
            <Mic className="animate-blink" size={18} style={{ color: '#10b981' }} />
          ) : (
            <MicOff size={18} style={{ color: '#64748b' }} />
          )}
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#f8fafc' }}>
            {isListening ? 'AI Audio Analyzer: Listening' : 'AI Audio Analyzer: Disabled'}
          </span>
        </div>
        
        <button
          onClick={isListening ? stopMic : startMic}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            background: isListening ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${isListening ? 'rgba(244, 63, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: isListening ? '#f43f5e' : '#94a3b8',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isListening ? 'Disable Mic' : 'Enable Mic'}
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#131a2c', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={50}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {!isListening && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(19, 26, 44, 0.75)', pointerEvents: 'none' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Microphone is off</span>
          </div>
        )}
      </div>

      {signals.scream && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '6px', borderRadius: '6px', animation: 'pulse 1s infinite' }}>
          <AlertTriangle size={14} style={{ color: '#f43f5e' }} />
          <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '500' }}>AI Alert: High Noise/Scream Triggered!</span>
        </div>
      )}
    </div>
  );
};
