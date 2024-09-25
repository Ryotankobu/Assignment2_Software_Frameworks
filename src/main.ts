import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Import this to provide HttpClient
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Import the routes

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),    // Provide the router with the routes
    provideHttpClient()       // Provide HttpClientModule here
  ]
}).catch(err => console.error(err));
