// pages/eye-detection.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import JSZip from 'jszip';

export default function VideoDetection(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const zip = new JSZip();
  const leftEyeFolder = zip.folder('left-eye');
  const rightEyeFolder = zip.folder('right-eye');

  useEffect(() => {
    const loadModels = async () => {
      try {
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
        downloadZip();
        return;
      }

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      if (detections) {
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();
        cropAndStoreEye(leftEye, 'left');
        cropAndStoreEye(rightEye, 'right');
      }
    }, 1000 / 30); // Capture at 30 FPS
  };

  const cropAndStoreEye = (
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

      canvas.toBlob(async (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `${eyeType}_eye_${timestamp}.png`;

          // Convert the Blob to ArrayBuffer and add to the appropriate folder in zip
          const arrayBuffer = await blob.arrayBuffer();
          if (eyeType === 'left') {
            leftEyeFolder?.file(filename, arrayBuffer);
          } else {
            rightEyeFolder?.file(filename, arrayBuffer);
          }
        }
      });
    }
  };

  const downloadZip = async () => {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'eye-detections.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <video ref={videoRef} src="/video/child.mp4" controls width="600" />
      <button
        onClick={processVideo}
        disabled={processing}
        className="bg-gray-200 text-gray-900 p-2 rounded-md m-8"
      >
        {processing ? 'Processing...' : 'Start Eye Detection'}
      </button>
      {processing && (
        <p className="bg-gray-200 text-gray-900 p-4">
          Processing video, please wait...
        </p>
      )}
    </div>
  );
}
