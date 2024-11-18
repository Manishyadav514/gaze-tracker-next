// types/mediapipe.d.ts
declare module '@mediapipe/face_mesh' {
    export class FaceMesh {
      constructor(config: { locateFile: (path: string) => string });
      setOptions(options: any): void;
      onResults(callback: (results: any) => void): void;
      send(input: { image: HTMLVideoElement }): Promise<void>;
      close(): void;
    }
  }
  
  declare module '@mediapipe/camera_utils' {
    export class Camera {
      constructor(
        video: HTMLVideoElement,
        config: {
          onFrame: () => Promise<void>;
          width: number;
          height: number;
        }
      );
      start(): void;
    }
  }
  