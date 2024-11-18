// pages/eye-detection.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import JSZip from 'jszip';
import path from 'path';
import ProcessGaze from '../../../componennt/ProcessGaze';

export default function VideoDetection(): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<string | null>('/video/child.mp4');
  const [progress, setProgress] = useState<number>(0);
  const [videoLength, setVideoLength] = useState<number>(0);
  const zip = new JSZip();
  const leftEyeFolder = zip.folder('left-eye');
  const rightEyeFolder = zip.folder('right-eye');
  const framePerSecond: number = 30;

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

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
    }
  };

  const processVideo = async () => {
    // Clear the output folder first and create necessary directories
    const clearResponse = await fetch('/api/clear-output', { method: 'GET' });

    // Check if the response is OK
    if (!clearResponse.ok) {
      // Try to parse the response as JSON if possible
      let errorMessage = 'Failed to clear output folder';
      try {
        const errorResponse = await clearResponse.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        console.error('Error parsing response:', e);
      }
      console.error(errorMessage);
      return;
    }

    // Proceed with video processing
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.play();
    setVideoLength(video.duration);
    setProcessing(true);

    const interval = setInterval(async () => {
      if (video.currentTime >= video.duration) {
        clearInterval(interval);
        setProcessing(false);
        setProgress(100);
        return;
      }

      const detections = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          })
        )
        .withFaceLandmarks();
      if (detections) {
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();
        await cropAndStoreEye(leftEye, 'left', video.currentTime);
        await cropAndStoreEye(rightEye, 'right', video.currentTime);
      }

      setProgress((video.currentTime / video.duration) * 100);
    }, 1000 / framePerSecond);
  };

  const cropAndStoreEye = async (
    eyeLandmarks: faceapi.Point[],
    eyeType: 'left' | 'right',
    currentTime: number
  ) => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    const { x, y } = eyeLandmarks[0];
    const padding = 55; // Increase padding

    const eyeWidth = eyeLandmarks[3].x - eyeLandmarks[0].x;
    const eyeHeight = eyeLandmarks[4].y - eyeLandmarks[1].y;

    // Increase width and height by additional margins
    const width = eyeWidth + padding * 2; // Extra space on left and right
    const height = eyeHeight + padding * 2; // Extra space on top and bottom

    // Adjust the x and y coordinates to account for padding
    const xWithPadding = eyeLandmarks[0].x - padding;
    const yWithPadding = eyeLandmarks[1].y - padding;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        video,
        xWithPadding,
        yWithPadding,
        eyeWidth + padding * 2,
        eyeHeight + padding * 2,
        0,
        0,
        width,
        height
      );

      // Convert the canvas to a Blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          const timestamp = currentTime.toFixed(2).replace('.', '-');
          const filename = `${eyeType}_eye_${timestamp}.png`;

          const arrayBuffer = await blob.arrayBuffer();
          const base64Image = Buffer.from(arrayBuffer).toString('base64');
          if (eyeType === 'left') {
            leftEyeFolder?.file(filename, arrayBuffer);
          } else {
            rightEyeFolder?.file(filename, arrayBuffer);
          }
          // Send the image data to the server
          const response = await fetch('/api/save-eye', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eyeType,
              filename,
              imageData: base64Image,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save eye image:', await response.json());
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
      <div className="container w-full flex justify-center items-center">
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="my-4"
        />
        <button
          onClick={processVideo}
          disabled={processing || !videoFile}
          className="bg-gray-200 text-gray-900 p-2 rounded-md m-8"
        >
          {processing ? 'Processing...' : 'Start Eye Detection'}
        </button>
      </div>
      <ProcessGaze />
      <div className="w-full flex justify-center container items-center mx-auto">
        {processing && (
          <div className="w-full max-w-xl p-4">
            <div className="flex justify-between mb-2">
              <span>Processing: {progress.toFixed(2)}%</span>
              <span>Video Length: {videoLength.toFixed(2)}s</span>
            </div>
            <div className="w-full bg-gray-200 h-4 rounded-md">
              <div
                className="bg-blue-600 h-full rounded-md"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="container w-full flex flex-col justify-center items-center">
        <div className="w-full max-w-96">
          {videoFile && (
            <video
              ref={videoRef}
              src={videoFile}
              controls
              className="w-auto h-auto"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setVideoLength(videoRef.current.duration);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
