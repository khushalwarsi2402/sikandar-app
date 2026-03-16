import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, Routes } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';

// 1. We define a route that points to your Home Page
const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app/home/home.page').then((m) => m.HomePage),
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    // 2. We give those routes to the app here
    provideRouter(routes), 
    provideHttpClient()
  ],
});