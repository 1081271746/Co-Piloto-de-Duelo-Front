import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(() => {
  const root = document.querySelector('app-root');
  if (root) root.textContent = 'No pudimos iniciar Co-Piloto. Revisa la configuración de conexión y recarga la página.';
});
