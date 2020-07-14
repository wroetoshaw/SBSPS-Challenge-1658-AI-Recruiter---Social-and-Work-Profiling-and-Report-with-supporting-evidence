import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
declare global {
    interface Window { plugins: any; }
  }
  
window.plugins = window.plugins || {};
  
platformBrowserDynamic().bootstrapModule(AppModule);
