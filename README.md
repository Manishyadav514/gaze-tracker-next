

---

# Next.js Face Detection App

This Next.js application features two main components:

1. **Video Processing**: Detects left and right eyes from a video, saves them in separate folders, and zips them for download.
2. **Image Processing**: Detects the gender and age of a face in an uploaded image.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Usage](#usage)
  - [Video Processing](#video-processing)
  - [Image Processing](#image-processing)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Known Issues](#known-issues)
- [License](#license)

## Demo

Add a link or GIF of your application here.

## Features

- Detects the left and right eyes from a video at a rate of 30 frames per second.
- Saves the detected eye images in separate folders for left and right eyes and packages them into a downloadable ZIP file.
- Detects gender and age from an uploaded image and overlays this information on the image.

## Setup and Installation

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nextjs-face-detection.git
   cd nextjs-face-detection
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

### Model Files

To run the face detection functionalities, download the required models from [face-api.js](https://github.com/justadudewhohacks/face-api.js) and place them in the `/public/models` directory.

## Usage

### Video Processing

1. Go to the Video Processing page.
2. Upload a video file (MP4 format).
3. Click the **Start Eye Detection** button to begin processing the video.
4. The application will extract left and right eyes from the video frames and save them in separate folders inside a ZIP file. You can download this ZIP file once processing is complete.

### Image Processing

1. Go to the Image Processing page.
2. Upload an image file (PNG, JPG, JPEG formats).
3. Click the **Detect Age and Gender** button.
4. The app will detect the face, estimate the age and gender, and overlay this information on the image.

## Project Structure

```
/nextjs-face-detection
├── public
│   ├── models          # Models for face-api.js
│   └── images          # Sample images
├── src
│   ├── components
│   │   ├── VideoEyeDetection.tsx       # Video processing component
│   │   └── ImageFaceProcessing.tsx     # Image processing component
│   ├── pages
│   │   ├── index.tsx                   # Home page
│   │   ├── video-detection.tsx         # Page for video processing
│   │   └── image-detection.tsx         # Page for image processing
└── README.md
```

## Technologies Used

- **Next.js**: Framework for React for server-side rendering and building web applications.
- **face-api.js**: JavaScript library for facial recognition and detection.
- **JSZip**: Library for creating and downloading ZIP files.
- **TypeScript**: JavaScript with static type definitions.
- **HTML5 Canvas**: Used to process and draw on images.

## Known Issues

- **Performance**: Video processing can be CPU-intensive. Using lower-resolution videos or images can help optimize the performance.
- **Accuracy**: The accuracy of age and gender detection can vary based on the quality of the uploaded image.

## License

This project is open-source and available under the [MIT License](LICENSE).
