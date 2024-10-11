'use client';
// pages/eye-detection.tsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function ImageDetection(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load face-api.js models from the public/models folder
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };
    loadModels();
  }, []);

  const processVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.play();
    setProcessing(true);

    const interval = setInterval(async () => {
      if (video.paused || video.ended) {
        clearInterval(interval);
        setProcessing(false);
        return;
      }

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      if (detections) {
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();
        cropAndDownloadEye(leftEye, 'left');
        cropAndDownloadEye(rightEye, 'right');
      }
    }, 1000 / 30); // Capture at 30 FPS
  };

  const cropAndDownloadEye = (
    eyeLandmarks: faceapi.Point[],
    eyeType: 'left' | 'right'
  ) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const { x, y } = eyeLandmarks[0];
    const width = eyeLandmarks[3].x - eyeLandmarks[0].x;
    const height = eyeLandmarks[4].y - eyeLandmarks[1].y;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, x, y, width, height, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${eyeType}_eye_${Date.now()}.png`;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    }
  };

  return (
    <div>
      <h1>Eye Detection from Image</h1>
    </div>
  );
}
