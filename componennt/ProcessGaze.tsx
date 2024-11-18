import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function ProcessGaze() {
  const [gazeData, setGazeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Added errorMessage state

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Ensure this path is correct
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        ]);
        console.log('Models loaded successfully');
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
        setErrorMessage('Error loading models, please try again later.');
      }
    };
    loadModels();
  }, []);

  const handleProcessGaze = async () => {
    if (!modelsLoaded) {
      console.error('Models not loaded yet');
      setErrorMessage('Models are not loaded yet, please wait.');
      return; // Prevent further processing if models are not loaded
    }

    setLoading(true);
    setErrorMessage(null); // Clear any previous error messages
    try {
      const leftEyeImagePath = '/output/normal-eye.png';
      const rightEyeImagePath = '/output/normal-eye.png';

      const leftEyeImage = await fetchImageAsDataURL(leftEyeImagePath);
      const rightEyeImage = await fetchImageAsDataURL(rightEyeImagePath);

      // Process gaze and only call detectSingleFace after models are loaded
      const gazeResult: any = await estimateGaze(leftEyeImage, rightEyeImage);
      if (gazeResult) {
        setGazeData(gazeResult);
        console.log('Gaze data:', gazeResult);
      } else {
        console.warn('No gaze data was generated.');
        setErrorMessage('No gaze data was generated.');
      }
    } catch (error) {
      console.error('Error processing gaze:', error);
      setErrorMessage('Error processing gaze, please check the input images.');
    } finally {
      setLoading(false);
    }
  };

  const fetchImageAsDataURL = async (imagePath: string) => {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Error fetching image: ${response.statusText}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error in fetchImageAsDataURL:', error);
      setErrorMessage('Error fetching image. Please ensure the image path is correct.');
      throw error; // Rethrow the error for handling upstream
    }
  };

  const getEyeCenter = (eyePoints: any[]) => {
    const x =
      eyePoints.reduce((sum, point) => sum + point.x, 0) / eyePoints.length;
    const y =
      eyePoints.reduce((sum, point) => sum + point.y, 0) / eyePoints.length;
    return { x, y };
  };

  const estimateGaze = async (
    leftEyeDataUrl: string,
    rightEyeDataUrl: string
  ) => {
    try {
      console.log('Fetching images...');
      const leftEyeImage = await faceapi.fetchImage(leftEyeDataUrl);
      const rightEyeImage = await faceapi.fetchImage(rightEyeDataUrl);
  
      console.log('Detecting faces and landmarks...');
      const leftEyeLandmarks = await faceapi
        .detectSingleFace(leftEyeImage)
        .withFaceLandmarks();
      const rightEyeLandmarks = await faceapi
        .detectSingleFace(rightEyeImage)
        .withFaceLandmarks();
  
      if (!leftEyeLandmarks) {
        console.error('Failed to detect landmarks for left eye.');
        setErrorMessage('Failed to detect landmarks for the left eye.');
        return null;
      }
  
      if (!rightEyeLandmarks) {
        console.error('Failed to detect landmarks for right eye.');
        setErrorMessage('Failed to detect landmarks for the right eye.');
        return null;
      }
  
      console.log('Left eye landmarks:', leftEyeLandmarks);
      console.log('Right eye landmarks:', rightEyeLandmarks);
  
      const leftEyeCenter = getEyeCenter(leftEyeLandmarks.landmarks.getLeftEye());
      const rightEyeCenter = getEyeCenter(rightEyeLandmarks.landmarks.getRightEye());
  
      console.log('Left eye center:', leftEyeCenter);
      console.log('Right eye center:', rightEyeCenter);
  
      const gazeDirection = {
        horizontal: leftEyeCenter.x < rightEyeCenter.x ? 'left' : 'right',
        vertical: leftEyeCenter.y < rightEyeCenter.y ? 'up' : 'down',
      };
  
      console.log('Gaze direction:', gazeDirection);
  
      const gazeCenter = {
        x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
        y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
      };
  
      console.log('Gaze center:', gazeCenter);
  
      const detectionData = {
        timestamp: Date.now(),
        leftEyeCenter,
        rightEyeCenter,
        horizontal: gazeDirection.horizontal,
        vertical: gazeDirection.vertical,
        gazeCenter,
      };
  
      return detectionData;
    } catch (error) {
      console.error('Error during gaze estimation:', error);
      setErrorMessage('An error occurred during gaze estimation.');
      return null;
    }
  };
  

  return (
    <div>
      <button
        onClick={handleProcessGaze}
        disabled={loading}
        className="bg-gray-200 text-gray-900 p-2 rounded-md m-8"
      >
        {loading ? 'Processing...' : 'Process Gaze Data'}
      </button>

      {gazeData && (
        <div>
          <h3>Gaze Data:</h3>
          <pre>{JSON.stringify(gazeData, null, 2)}</pre>
        </div>
      )}

      {errorMessage && (
        <div>
          <p className='text-red-300'>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
