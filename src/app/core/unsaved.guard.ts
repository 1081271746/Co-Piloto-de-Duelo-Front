import { CanDeactivateFn } from '@angular/router';

export interface UnsavedChanges { canLeave(): boolean }
export const unsavedGuard: CanDeactivateFn<UnsavedChanges> = component => component.canLeave();
