import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import * as faceapi from 'face-api.js';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');
const LEFT_EYE_DIR = path.join(OUTPUT_DIR, 'left-eye');
const RIGHT_EYE_DIR = path.join(OUTPUT_DIR, 'right-eye');
const MODELS_DIR = path.join(process.cwd(), 'public', 'models');

export async function POST() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_DIR);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_DIR);

    const gazeData: any[] = [];

    // Process first image from left-eye and right-eye directories
    const leftEyeFile = fs.readdirSync(LEFT_EYE_DIR)[0];
    const rightEyeFile = fs.readdirSync(RIGHT_EYE_DIR)[0];
    const leftEyeImagePath = path.join(LEFT_EYE_DIR, leftEyeFile);
    const rightEyeImagePath = path.join(RIGHT_EYE_DIR, rightEyeFile);
    console.log(leftEyeFile, leftEyeImagePath);

    // Detect gaze direction and calculate gaze center
    // const gazeResult = await estimateGaze(leftEyeImagePath, rightEyeImagePath);
    // if (gazeResult) {
    //   gazeData.push(gazeResult);
    // }

    // Convert gaze data to CSV
    const csv = parse(gazeData);
    const csvFilePath = path.join(OUTPUT_DIR, 'gaze-data.csv');
    fs.writeFileSync(csvFilePath, csv);

    // Return the CSV file for download
    return NextResponse.json({
      message: 'CSV file created successfully',
      url: '/output/gaze-data.csv',
    });
  } catch (error) {
    console.error('Error processing images:', error);
    return NextResponse.json(
      { error: 'Error processing images' },
      { status: 500 }
    );
  }
}

function getEyeCenter(eyePoints: any[]) {
  const x =
    eyePoints.reduce((sum, point) => sum + point.x, 0) / eyePoints.length;
  const y =
    eyePoints.reduce((sum, point) => sum + point.y, 0) / eyePoints.length;
  return { x, y };
}

async function estimateGaze(
  leftEyeImagePath: string,
  rightEyeImagePath: string
) {
  const leftEyeImage = await faceapi.fetchImage(leftEyeImagePath);
  const rightEyeImage = await faceapi.fetchImage(rightEyeImagePath);

  const leftEyeDetection = await faceapi
    .detectSingleFace(leftEyeImage)
    .withFaceLandmarks();
  const rightEyeDetection = await faceapi
    .detectSingleFace(rightEyeImage)
    .withFaceLandmarks();

  if (leftEyeDetection && rightEyeDetection) {
    const leftEyeCenter = getEyeCenter(leftEyeDetection.landmarks.getLeftEye());
    const rightEyeCenter = getEyeCenter(
      rightEyeDetection.landmarks.getRightEye()
    );

    // Calculate gaze direction
    const gazeDirection = {
      horizontal: leftEyeCenter.x < rightEyeCenter.x ? 'left' : 'right',
      vertical: leftEyeCenter.y < rightEyeCenter.y ? 'up' : 'down',
    };

    const gazeCenter = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
    };

    return {
      timestamp: Date.now(),
      leftEyeCenter,
      rightEyeCenter,
      horizontal: gazeDirection.horizontal,
      vertical: gazeDirection.vertical,
      gazeCenter,
    };
  }
  return null;
}
