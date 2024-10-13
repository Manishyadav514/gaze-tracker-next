// components/ImageFaceProcessing.tsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function ImageFaceProcessing() {
  const [processing, setProcessing] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<string>('/images/youngman2.png');
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.ageGenderNet.loadFromUri('/models'),
      ]);
    };

    loadModels();
  }, []); // Only load models on the initial render

  const detectFace = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setProcessing(true);
    const faceData = await faceapi
      .detectAllFaces(imageRef.current)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withAgeAndGender();

    canvasRef.current.style.position = 'absolute';
    canvasRef.current.style.left = `${imageRef.current.offsetLeft}px`;
    canvasRef.current.style.top = `${imageRef.current.offsetTop}px`;
    canvasRef.current.width = imageRef.current.width;
    canvasRef.current.height = imageRef.current.height;

    const resizedFaceData = faceapi.resizeResults(faceData, {
      width: imageRef.current.width,
      height: imageRef.current.height,
    });

    faceapi.draw.drawDetections(canvasRef.current, resizedFaceData);

    resizedFaceData.forEach((face) => {
      const { age, gender, genderProbability } = face;
      const genderText = `${gender} - ${genderProbability.toFixed(2)}`;
      const ageText = `${Math.round(age)} years`;
      const textField = new faceapi.draw.DrawTextField(
        [genderText, ageText],
        face.detection.box.topRight
      );
      if (canvasRef.current) {
        textField.draw(canvasRef.current);
      }
    });

    setProcessing(false);
  };

  return (
    <div className="h-full flex flex-col justify-center align-middle items-center">
      <div className="container w-full flex justify-center items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="my-4"
        />
        <button
          onClick={detectFace}
          disabled={processing || !imageFile}
          className="bg-gray-200 text-gray-900 p-2 rounded-md m-8"
        >
          {processing ? 'Processing...' : 'Start Eye Detection'}
        </button>
        {processing && (
          <p className="text-white p-4 text-center">
            Processing image, please wait...
          </p>
        )}
      </div>

      <div className="container w-full flex justify-center items-center">
        <img
          ref={imageRef}
          src={imageFile}
          alt="Face"
          className="max-w-full"
          width={500}
          height={500}
        />
        <canvas ref={canvasRef} className="absolute" />
      </div>
    </div>
  );
}
