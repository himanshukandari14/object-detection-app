'use client'
import React, { useRef, useEffect, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

interface Prediction {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

const ObjectDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    const startVideo = async () => {
      if (video) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.play();
        } catch (err) {
          console.error('Error accessing camera:', err);
        }
      }
    };

    const detectObjects = async () => {
      if (model && video && canvas && context) {
        const detections = await model.detect(video);
        setPredictions(detections as Prediction[]);
        context.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;

          // Draw bounding box
          context.beginPath();
          context.rect(x, y, width, height);
          context.lineWidth = 2;
          context.strokeStyle = 'red';
          context.stroke();

          // Calculate distance
          const distance = calculateDistance(width);

          // Draw label
          context.font = '18px Arial';
          context.fillStyle = 'red';
          context.fillText(
            `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
            x,
            y > 10 ? y - 10 : 10
          );
          context.fillText(`Distance: ${distance.toFixed(2)} meters`, x, y > 30 ? y - 30 : 30);
        });

        requestAnimationFrame(detectObjects);
      }
    };

    if (video && canvas) {
      video.addEventListener('loadeddata', () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          detectObjects();
        }
      });
      video.addEventListener('playing', () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          detectObjects();
        }
      });
      startVideo();
    }

    return () => {
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [model]);

  const calculateDistance = (boundingBoxWidth: number): number => {
    const KNOWN_WIDTH = 0.5; // Known width of the object in meters
    const FOCAL_LENGTH = 800; // Adjust based on your camera calibration
    if (boundingBoxWidth === 0) return 0;
    return (KNOWN_WIDTH * FOCAL_LENGTH) / boundingBoxWidth;
  };

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ border: '1px solid black' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, border: '1px solid black' }}
      />
    </div>
  );
};

export default ObjectDetection;
