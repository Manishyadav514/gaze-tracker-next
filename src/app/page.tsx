'use client';
import Head from 'next/head';
import VideoDetection from './face-api/VideoDetection';
import { useState } from 'react';
import ImageDetection from './ImageDetection';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const routes = [
    { title: 'Gaze Detection with Media Pipe', route: 'media-pipe' },
    { title: 'Gaze Detection with face api', route: 'face-api' },
  ];
  return (
    <div className="h-auto w-screen overflow-hidden">
      <div className="px-8 md:px-20 py-4">
        <h1 className="text-2xl"> Face Feature Extractor </h1>
        <div className="w-full items-center flex justify-center flex-col gap-4">
          {routes.map((item) => (
            <button
              className="text-lg p-2 m-4 bg-red-900 rounded-sm capitalize"
              onClick={() => router.push(item.route)}
              key={item.route}
            >
              {`>> ${item.title}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
