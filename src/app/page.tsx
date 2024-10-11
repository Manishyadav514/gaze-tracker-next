'use client';
import Head from 'next/head';
import VideoDetection from './VideoDetection';
import { useState } from 'react';
import ImageDetection from './ImageDetector';

export default function Home() {
  const [isVideoProcessing, setIsVideoProcessing] = useState(true);
  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="px-8 md:px-20 py-4">
        <h1 className="text-2xl"> Face Feature Extractor </h1>
        <button
          className="text-lg p-2 m-4 bg-red-900 rounded-sm"
          onClick={() => setIsVideoProcessing((prev) => !prev)}
        >
          {isVideoProcessing ? '>> Video Processing' : '>> Image Processing'}
        </button>
      </div>
      {isVideoProcessing ? <VideoDetection /> : <ImageDetection />}
    </div>
  );
}
