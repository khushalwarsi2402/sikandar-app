// @ts-ignore
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bismillah.meats',
  appName: 'Bismillah Fresh Meats',
  // 👇 THIS IS THE MAGIC LINE WE CHANGED 👇
  webDir: 'dist/sikandar-app/browser' 
};

export default config;
