'use client';
import React, { useState, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const ImageInputFaceLandmark: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const directionElementRef = useRef<HTMLParagraphElement | null>(null);
  const eyeBlendShapesListRef = useRef<HTMLUListElement | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectFaceLandmarks = async () => {
    if (!selectedImage || !canvasRef.current) return;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );

    const faceLandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'IMAGE',
        numFaces: 1,
      }
    );

    const imageElement = new Image();
    imageElement.src = selectedImage;

    imageElement.onload = async () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      ctx.drawImage(imageElement, 0, 0);

      const result = await faceLandmarker.detect(imageElement); // Await the result
      console.log('Face Landmark Data:', result);

      if (result.faceLandmarks) {
        // Draw landmarks
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        result.faceLandmarks.forEach((face: { x: number; y: number }[]) => {
          face.forEach((landmark: { x: number; y: number }) => {
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.stroke();
          });
        });

        const gazeDirection = detectGazeDirection(result.faceBlendshapes);
        console.log(gazeDirection);

        if (directionElementRef.current) {
          directionElementRef.current.textContent = `Looking ${gazeDirection}`;
        }
      }
    };
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

    const eyeData: any = blendShapes.reduce(
      (acc: any, { categoryName, score }: any) => {
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
          ([key, value]: any) =>
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

    return determineGazeDirection(eyeData);
  };

  return (
    <div className="w-full h-full m-auto container p-20">
      <h1 className="text-gray-300 text-3xl text-center">
        Upload your Image for Landmark Detection
      </h1>
      <div id="w-full h-full flex flex-col gap-12 item-center justify-center ">
        <p
          id="eye-direction"
          className="text-center text-gray-400 text-base py-4"
          ref={directionElementRef}
        ></p>
        <div className="w-full flex flex-row gap-4 items-center justify-center py-12">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <button
            onClick={detectFaceLandmarks}
            className="p-2 bg-gray-700 text-base rounded-md "
          >
            Detect Face Landmarks
          </button>
        </div>

        <div className="w-full h-[400px] max-w-2xl m-auto flex flex-col items-center relative bg-slate-800 rounded-md">
          <canvas
            className="absolute h-full w-full rounded-lg"
            id="output_canvas"
            ref={canvasRef}
          ></canvas>
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" ref={eyeBlendShapesListRef}></ul>
        </div>
      </div>
    </div>
  );
};

export default ImageInputFaceLandmark;

export const determineGazeDirection = (data: any) => {
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
