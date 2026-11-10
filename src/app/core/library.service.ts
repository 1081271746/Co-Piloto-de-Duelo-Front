import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client.service';
import type { CompletionInput, Exercise, ExerciseCompletion, Resource } from './models/library.models';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private api = inject(ApiClient);
  exercises(category?: string, offset = 0) { return this.api.get<Exercise[]>('/exercises', { category, offset, limit: 20 }); }
  exercise(id: string) { return this.api.get<Exercise>(`/exercises/${encodeURIComponent(id)}`); }
  resources(category?: string, offset = 0) { return this.api.get<Resource[]>('/resources', { category, offset, limit: 20 }); }
  complete(id: string, data: CompletionInput) {
    return this.api.post<ExerciseCompletion>(`/exercises/${encodeURIComponent(id)}/complete`, data);
  }
  history(offset = 0) { return this.api.get<ExerciseCompletion[]>('/exercise-history', { offset, limit: 20 }); }
}
