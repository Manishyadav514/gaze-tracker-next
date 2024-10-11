# Audio-to-Text Conversion Application

This project is a Next-based web application that allows users to upload MP3 audio files and converts them to text using the AssemblyAI API.

## Features

- Upload MP3 audio files.
- Convert uploaded audio to text using AssemblyAI API.
- Display the transcribed text on the webpage.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Manishyadav514/nlp-assemblyai-frontend.git
   cd nlp-assemblyai-frontend
   npm install
   ```

### API Endpoint

Check backend repo, [nlp-assemblyai-backend](https://nodejs.org/), for API endpoint.

Example Response

```
{
  s"transcript": "This is the transcribed text from the audio file."
}
```

## **Deployment**

I have deployed Next.js app on GitHub Pages which involves a few steps, as GitHub Pages is primarily for static sites, whereas Next.js apps often require a server. However, you can deploy a static export of your Next.js app to GitHub Pages. Here’s how you can do it:

### Step 1: Configure Next.js for Static Export

1. Open your `next.config.js` file (create one if it doesn't exist) and add the following configuration to export your Next.js app as static HTML:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: "export",
     images: {
       unoptimized: true, // Disable Image Optimization if needed
     },
     trailingSlash: true, // Adds trailing slash to all routes
     basePath: "/your-repo-name", // Replace with your GitHub repository name
   };

   module.exports = nextConfig;
   ```

   - `output: 'export'` tells Next.js to generate a static site.
   - `images: { unoptimized: true }` is necessary if you're using Next.js image optimization features that are not compatible with static hosting.
   - `basePath` is important if your GitHub Pages site will not be served from the root of a domain (e.g., `username.github.io/your-repo-name`).

### Step 2: Build and Export the Static Site

1. Update your `package.json` scripts to include a build command for static export:

   ```json
   {
     "scripts": {
       "build": "next build",
       "export": "next export",
       "deploy": "npm run build && npm run export && gh-pages -d out"
     }
   }
   ```

   - The `export` command will generate the static files in an `out` directory.
   - The `deploy` script will build, export, and deploy your site to GitHub Pages.

### Step 3: Install `gh-pages` Package

1. Install the `gh-pages` package to handle deployment to GitHub Pages:

   ```bash
   npm install gh-pages --save-dev
   ```
2. Add a `homepage` field in your `package.json` to point to your GitHub Pages URL:

   ```json
   {
     "homepage": "https://username.github.io/your-repo-name"
   }
   ```

### Step 4: Deploy to GitHub Pages

1. Run the following command to build, export, and deploy your Next.js app to GitHub Pages:

   ```bash
   npm run deploy
   ```

   This command will create a new branch named `gh-pages` in your GitHub repository and push the contents of the `out` directory there. GitHub Pages will automatically serve the files from this branch.

### Step 5: Configure GitHub Repository

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Pages**.
3. Under **Source**, select the `gh-pages` branch.

Your Next.js app should now be deployed and accessible via `https://username.github.io/your-repo-name`.

### Important Considerations

- **Dynamic Routes**: Since GitHub Pages is a static hosting solution, dynamic routes that rely on server-side functionality won't work. Ensure your app can be fully pre-rendered or use client-side rendering for dynamic content.
- **Custom Domain**: If you’re using a custom domain, ensure your DNS is configured correctly and update the `homepage` field in `package.json` accordingly.

## **Converting this Website to PWA**

Using `next-pwa`, you can leverage the significant advantages of Progressive Web Applications (PWAs), such as improved discoverability, reduced memory usage, cost-effective development, and notably fast offline performance. Any web application, regardless of its type or complexity, can be converted into a PWA with relative ease. Transforming a website into a Progressive Web App involves adding a few features and modifying some code to enable the website to function like a native app on mobile devices. Here are the general steps to achieve this.

### **Step 1: Build a Basic Website**

- Secure connection to PWA through HTTPS will help users feel more protected.
- website must be responsive

### Step 2: Install

We have App Router architecture of Next.js so will folllow that specific methods. Will be using next-pwa package to make PWA.

```
yarn add next-pwa && yarn add -D webpack
```

### **Step 3: Create a Web App Manifest File**

It describes your PWA, including its name, icons, and other details. To create the web app manifest, you can use a tool like PWA Builder or create it manually. Once you have the manifest file, add it to your website’s root directory. If you don’t have a structured system for your templates, add these lines to get started:

Update `app/manifest.json` (App Router) or `public/manifest.json` (Pages Router) with the following content:

app/manifest.json

```
{
  "name": "nlp_pwa",
  "short_name": "nlp_pwa",
  "description": "Your App Description",
  "start_url": "/",
  "icons": [
    {
      "src": "./196.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#ffee00",
  "background_color": "#ffee00",
  "display": "standalone"
}
```

### **Step 4: Add metadata to `<head />`**

Add the following to your:

**app/layout.tsx**

```
import type { Metadata, Viewport } from "next";

const APP_NAME = "PWA App";
const APP_DEFAULT_TITLE = "My Awesome PWA App";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Best PWA app in the world!";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
```

**pages/\_app.tsx**

```
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>My awesome PWA app</title>
        <meta name="description" content="Best PWA app in the world!" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icons/mask-icon.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/touch-icon-ipad.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/touch-icon-iphone-retina.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/touch-icon-ipad-retina.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yourdomain.com" />
        <meta name="twitter:title" content="My awesome PWA app" />
        <meta name="twitter:description" content="Best PWA app in the world!" />
        <meta name="twitter:image" content="/icons/twitter.png" />
        <meta name="twitter:creator" content="@DavidWShadow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="My awesome PWA app" />
        <meta property="og:description" content="Best PWA app in the world!" />
        <meta property="og:site_name" content="My awesome PWA app" />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:image" content="/icons/og.png" />
        {/* add the following only if you want to add a startup image for Apple devices. */}
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_2048.png"
          sizes="2048x2732"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_1668.png"
          sizes="1668x2224"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_1536.png"
          sizes="1536x2048"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_1125.png"
          sizes="1125x2436"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_1242.png"
          sizes="1242x2208"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_750.png"
          sizes="750x1334"
        />
        <link
          rel="apple-touch-startup-image"
          href="/images/apple_splash_640.png"
          sizes="640x1136"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
```

if using custom service worker, add the below code in the head of `app/layout.tsx `**(App Router) or app.js (Page Router)**

```
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/196.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* <!-- iOS Splash Screens --> */}
        <link
          href="/splashscreens/iphone5_splash.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
      </head>
```

### **Step 5: Add a Service Worker**

imp: use this if next-pwa package doesn't work (It didn't work for me while deploying as a statis site on Github Pages)

A service worker is a JavaScript file that runs in the background and intercepts network requests, and it is the core element of modern PWA technology. The Service Worker will be responsible for all file caching, server pushing notifications, content updates, data manipulation, etc., by listening to network requests on the server and placing as .js files on user devices. The Service Worker will then monitor these events and return the appropriate response.

In addition, the displayed content is customized based on the cached cache even when the user is offline. Besides, you can also use cache data as variables and parameters. This means that although the first load takes a few seconds, subsequent times by leveraging service workers should be faster. Therefore, this allows a PWA to work offline and load quickly.

You can add a service worker to your website by writing the code yourself or using a tool like Workbox. You can copy the code below. To use this code, create a new file and name it _sw.js_ before saving your changes.
next-pwa handles the service worker setup, so you don't need to manually create one. Just ensure that the service worker is correctly registered in your app.

`update public/service-worker.js`

```
const CACHE_NAME = "my-pwa-cache-v1";
const urlsToCache = ["/"]; // add other urls that needs to be cached

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

```


### **Step 6. Wrap your Next config with `withPWA`\***

Update or create your `next.config.js` with

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

module.exports = withPWA(nextConfig);
```

```

const nextConfig = {};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: /^\/(?!api\/).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
  ],
});

module.exports = withPWA({
  ...nextConfig,
});

```

Go with the below code if using custom service worker instead of next-pwa

```
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "export", //remove this line if not expoerting as a static site
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
};

module.exports = nextConfig;
```

After running next build, this will generate two files in your public: workbox-\*.js and sw.js, which will automatically be served statically.

## Issues and Challanges

### Deploying `Next.js` app as static site on `Github Pages` and creating PWA

1. `next-pwa` typically requires setting the `output: 'export'` in the `next.config.js` when deploying to static sites like GitHub Pages.
2. GitHub Actions YAML file is used for deploying a Next.js site to GitHub Pages. To run static code locally `npx serve@latest out`
3. remove export script from package.json as `next export` has been removed in favor of 'output: export' in next.config.js.
