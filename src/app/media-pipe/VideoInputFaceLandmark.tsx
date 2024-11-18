'use client';
import { useState, useEffect, useRef } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from '@mediapipe/tasks-vision';

// Define types for results and gaze data
type GazeResult = {
  timestamp: number;
  gazeDirection: string;
};

type BlendShapeData = {
  [key: string]: number;
};

const VideoInputFaceLandmark = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const directionElementRef = useRef<HTMLParagraphElement | null>(null);
  const eyeBlendShapesListRef = useRef<HTMLUListElement | null>(null);
  const [gazeResults, setGazeResults] = useState<GazeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const FPS = 30;
  let faceLandmarker: any;
  let drawingUtils: any;

  useEffect(() => {
    createFaceLandmarker();
  }, []);

  const createFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      outputFaceBlendshapes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    });

    drawingUtils = new DrawingUtils(canvasRef.current?.getContext('2d')!);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.addEventListener('loadeddata', () => {
          processVideo();
        });
      }
    }
  };

  const startWebcam = async () => {
    const constraints = {
      video: {
        facingMode: 'user', // Use front camera
        width: { ideal: 720 },
        height: { ideal: 400 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.addEventListener('loadeddata', () => {
          processVideo();
        });
      }
    } catch (error) {
      console.error('Error accessing webcam: ', error);
    }
  };

  const processVideo = async () => {
    if (!videoRef.current || !canvasRef.current || !directionElementRef.current)
      return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d')!;
    const directionElement = directionElementRef.current;
    const fixedWidth = 720;
    const fixedHeight = 400;

    video.width = fixedWidth;
    video.height = fixedHeight;
    canvasElement.width = fixedWidth;
    canvasElement.height = fixedHeight;

    let lastTimestamp = -1;

    const processFrame = async (timestamp: number) => {
      if (timestamp - lastTimestamp < 1000 / FPS) {
        requestAnimationFrame(processFrame);
        return;
      }
      lastTimestamp = timestamp;

      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      const startTimeMs = performance.now();
      const results = await faceLandmarker.detectForVideo(video, startTimeMs);

      if (results?.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: '#C0C0C070', lineWidth: 1 }
          );
        }

        const gazeDirection = detectGazeDirection(results.faceBlendshapes);
        console.log(gazeDirection);
        gazeResults.push({
          timestamp: parseFloat(video.currentTime.toFixed(3)),
          gazeDirection,
        });
      }

      if (!video.paused && !video.ended) {
        requestAnimationFrame(processFrame);
      } else {
        downloadJSON(gazeResults, 'gaze_results.json');
      }
    };

    requestAnimationFrame(processFrame);
  };

  const detectGazeDirection = (blendShapesData: any) => {
    if (!blendShapesData || !blendShapesData.length) return 'No eye detected';

    const blendShapes = blendShapesData[0].categories;
    const eyeKeys = [
      'eyeLookInLeft',
      'eyeLookInRight',
      'eyeLookOutLeft',
      'eyeLookOutRight',
    ];

    const eyeData: BlendShapeData = blendShapes.reduce(
      (acc: BlendShapeData, { categoryName, score }: any) => {
        if (eyeKeys.includes(categoryName)) {
          acc[categoryName] = score;
        }
        return acc;
      },
      {}
    );

    if (eyeBlendShapesListRef.current) {
      eyeBlendShapesListRef.current.innerHTML = Object.entries(eyeData)
        .map(
          ([key, value]) =>
            `<li class="blend-shapes-item">
              <span class="blend-shapes-label">${key}</span>
              <span class="blend-shapes-value" style="width: calc(${
                value * 100
              }% - 120px)">
                ${value.toFixed(4)}
              </span>
            </li>`
        )
        .join('');
    }

    const gaze = determineGazeDirection(eyeData);
    if (directionElementRef.current)
      directionElementRef.current.textContent = `Looking ${gaze}`;
    return gaze;
  };

  const downloadJSON = (data: GazeResult[], filename: string) => {
    console.log({ gazeResults });
    if (directionElementRef.current)
      directionElementRef.current.textContent = `Downloaded`;

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full h-full m-auto container p-20">
      <h1 className="text-gray-300 text-3xl text-center">
        Upload your Video for Landmark Detection
      </h1>
      <div id="w-full h-full flex flex-col item-center justify-center">
        <p
          id="eye-direction"
          className="text-center text-gray-400 text-base py-4"
          ref={directionElementRef}
        ></p>
        <div className="w-full flex items-center justify-center">
          <input
            type="file"
            id="video-input"
            accept="video/*"
            style={{ padding: '30px' }}
            onChange={handleFileChange}
          />
        </div>
        <div className="w-full h-[400px] max-w-2xl m-auto flex flex-col items-center relative">
          <video
            className="absolute h-full w-full rounded-lg bg-gray-800"
            id="webcam"
            ref={videoRef}
            autoPlay
            playsInline
          >
            Your browser does not support the video tag.
          </video>
          <canvas
            className="absolute h-full w-full rounded-lg"
            id="output_canvas"
            ref={canvasRef}
          ></canvas>
          {isProcessing && <p>We are processing the video, please wait...</p>}
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" ref={eyeBlendShapesListRef}></ul>
        </div>
      </div>
    </div>
  );
};

export default VideoInputFaceLandmark;

export const determineGazeDirection = (data: BlendShapeData) => {
  const { eyeLookInLeft, eyeLookInRight, eyeLookOutLeft, eyeLookOutRight } =
    data;

  if (
    eyeLookInLeft === undefined ||
    eyeLookInRight === undefined ||
    eyeLookOutLeft === undefined ||
    eyeLookOutRight === undefined
  ) {
    return 'No eye detected';
  }

  const centerThreshold = 0.2;

  if (eyeLookInRight > eyeLookInLeft && eyeLookOutLeft > eyeLookOutRight) {
    return 'Right';
  } else if (
    eyeLookInLeft > eyeLookInRight &&
    eyeLookOutRight > eyeLookOutLeft
  ) {
    return 'Left';
  } else if (
    Math.abs(eyeLookInLeft - eyeLookInRight) < centerThreshold &&
    Math.abs(eyeLookOutLeft - eyeLookOutRight) < centerThreshold
  ) {
    return 'Center';
  } else {
    return 'Uncertain';
  }
};
