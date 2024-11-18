import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'output');

export const dynamic = 'force-static';

export async function GET() {
  fs.rm(OUTPUT_DIR, { recursive: true, force: true }, (err) => {
    if (err) {
      return Response.json({
        error: 'Error clearing output directory',
      });
    }
    // Recreate the output directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    return Response.json({
      message: 'Output folder cleared and directories created',
    });
  });
  return Response.json({
    message: 'something went wrong',
  });
}
