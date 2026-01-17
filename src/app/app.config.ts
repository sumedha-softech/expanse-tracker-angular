import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations} from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';


export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(),provideAnimations(), provideRouter(routes),provideZoneChangeDetection({ eventCoalescing: true }), provideNativeDateAdapter(), provideRouter(routes)]
};


