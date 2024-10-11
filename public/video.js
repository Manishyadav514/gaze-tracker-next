const videoInput = document.getElementById('videoFileInput');
const video = document.getElementById('inputVideo');
const canvas = document.getElementById('overlay');
const outputContainer = document.getElementById('outputContainer');

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  console.log("Models loaded successfully.");
}

async function processVideo() {
  // Set the canvas dimensions to match the video dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  video.play();
  video.addEventListener('play', () => {
    setInterval(async () => {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      if (detections) {
        const leftEye = detections.landmarks.getLeftEye();
        const rightEye = detections.landmarks.getRightEye();

        // Crop and save each eye
        saveCroppedEye(leftEye, 'left');
        saveCroppedEye(rightEye, 'right');
      }
    }, 1000 / 30); // Process at 30 FPS
  });
}

function saveCroppedEye(eyeLandmarks, eyeType) {
  const [x, y] = eyeLandmarks[0];
  const width = eyeLandmarks[3][0] - eyeLandmarks[0][0];
  const height = eyeLandmarks[4][1] - eyeLandmarks[1][1];

  const eyeCanvas = document.createElement('canvas');
  eyeCanvas.width = width;
  eyeCanvas.height = height;
  const ctx = eyeCanvas.getContext('2d');

  ctx.drawImage(video, x, y, width, height, 0, 0, width, height);

  // Create and add download link
  eyeCanvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${eyeType}_eye_${Date.now()}.png`;
    link.textContent = `Download ${eyeType} eye image`;
    outputContainer.appendChild(link);
  });
}

// Load the selected video file into the video element
videoInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    video.src = fileURL;

    // Load models and start processing after the video is loaded
    await loadModels();
    video.addEventListener('loadeddata', processVideo);
  }
});
