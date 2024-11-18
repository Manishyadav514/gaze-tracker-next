import React from 'react';
import EyeTracker from './ImageInputFaceLandmark';
import VideoInputLandmark from './VideoInputFaceLandmark';
import ImageInputFaceLandmark from './ImageInputFaceLandmark';

const index = () => {
  return (
    <div>
      <VideoInputLandmark />
      <ImageInputFaceLandmark />
    </div>
  );
};

export default index;
