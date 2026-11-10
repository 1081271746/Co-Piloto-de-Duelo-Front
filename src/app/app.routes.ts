import type { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { unsavedGuard } from './core/unsaved.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', title: 'Iniciar sesión · Co-Piloto de Duelo', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', title: 'Crear cuenta · Co-Piloto de Duelo', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: 'dashboard', title: 'Mi espacio · Co-Piloto de Duelo', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'journal', title: 'Mi diario · Co-Piloto de Duelo', loadComponent: () => import('./features/journal/journal.component').then(m => m.JournalComponent) },
      { path: 'journal/new', title: 'Escribir · Co-Piloto de Duelo', canDeactivate: [unsavedGuard], loadComponent: () => import('./features/journal/journal-editor.component').then(m => m.JournalEditorComponent) },
      { path: 'journal/:id/edit', title: 'Editar entrada · Co-Piloto de Duelo', canDeactivate: [unsavedGuard], loadComponent: () => import('./features/journal/journal-editor.component').then(m => m.JournalEditorComponent) },
      { path: 'journal/:id', title: 'Mi entrada · Co-Piloto de Duelo', loadComponent: () => import('./features/journal/journal-detail.component').then(m => m.JournalDetailComponent) },
      { path: 'analysis', title: 'Mis reflexiones · Co-Piloto de Duelo', loadComponent: () => import('./features/analysis/analysis.component').then(m => m.AnalysisComponent) },
      { path: 'analysis/:id', title: 'Detalle de reflexión · Co-Piloto de Duelo', loadComponent: () => import('./features/analysis/analysis-detail.component').then(m => m.AnalysisDetailComponent) },
      { path: 'library', title: 'Biblioteca · Co-Piloto de Duelo', loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent) },
      { path: 'library/history', title: 'Actividades realizadas · Co-Piloto de Duelo', loadComponent: () => import('./features/library/exercise-history.component').then(m => m.ExerciseHistoryComponent) },
      { path: 'library/exercises/:id', title: 'Ejercicio · Co-Piloto de Duelo', loadComponent: () => import('./features/library/exercise-detail.component').then(m => m.ExerciseDetailComponent) },
      { path: 'tracking', title: 'Seguimiento · Co-Piloto de Duelo', loadComponent: () => import('./features/tracking/tracking.component').then(m => m.TrackingComponent) },
      { path: 'support', title: 'Acompañamiento · Co-Piloto de Duelo', loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent) },
      { path: 'settings', title: 'Mi cuenta · Co-Piloto de Duelo', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
    ],
  },
  { path: '**', title: 'Página no encontrada · Co-Piloto de Duelo', loadComponent: () => import('./shared/not-found.component').then(m => m.NotFoundComponent) },
];
