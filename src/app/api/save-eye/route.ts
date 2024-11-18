import { NextResponse } from 'next/server'; // Correct import for response handling
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');

export const dynamic = 'force-static';

export async function POST(request: Request) {
  const { eyeType, filename, imageData } = await request.json(); // Correctly parse the request body

  // Validate the required fields
  if (!eyeType || !filename || !imageData) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const eyeDir = path.join(
    OUTPUT_DIR,
    eyeType === 'left' ? 'left-eye' : 'right-eye'
  );

  // Ensure the eye directory exists
  fs.mkdirSync(eyeDir, { recursive: true });

  // Save the image
  const filePath = path.join(eyeDir, filename);
  const buffer: any = Buffer.from(imageData, 'base64');

  try {
    fs.writeFileSync(filePath, buffer);
    return NextResponse.json(
      { message: 'Image saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Error saving image' }, { status: 500 });
  }
}
