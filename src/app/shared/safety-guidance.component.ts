import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SafetyGuidance } from '../core/models/safety.models';
import { IconComponent } from './icon.component';
import { isSafeUrl, RiskPipe } from './format';

@Component({
  selector: 'app-safety-guidance',
  imports: [IconComponent, RiskPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="guide" role="alert" aria-labelledby="guide-title">
      <div class="top">
        <span class="mark"><app-icon name="heart" [size]="22" /></span>
        <div class="stack" style="gap: 4px">
          <p class="eyebrow">Tu seguridad primero · {{ guidance().risk_level | risk }}</p>
          <h2 id="guide-title">{{ heading() }}</h2>
        </div>
      </div>
      <p class="message">{{ guidance().message }}</p>
      @if (guidance().actions.length) {
        <ol class="actions">
          @for (action of guidance().actions; track $index) { <li>{{ action }}</li> }
        </ol>
      }
      @if (resources().length) {
        <div class="resources">
          <p class="label">Contactos de ayuda{{ guidance().country ? ' · ' + guidance().country : '' }}</p>
          <ul>
            @for (item of resources(); track item.name) {
              <li>
                <span class="name">{{ item.name }}</span>
                @if (item.link) {
                  <a [href]="item.value" target="_blank" rel="noopener noreferrer">{{ item.value }} <app-icon name="external" [size]="14" /></a>
                } @else {
                  <strong class="value">{{ item.value }}</strong>
                }
              </li>
            }
          </ul>
        </div>
      }
      @if (guidance().fallback) { <p class="fallback">{{ guidance().fallback }}</p> }
      @if (!guidance().location_configured) {
        <p class="faint">No tenemos tu país configurado, por eso los contactos pueden ser generales. Puedes indicarlo en <a routerLink="/settings">Ajustes</a>.</p>
      }
      <p class="disclaimer">Esta aplicación no contacta servicios de emergencia por ti. {{ guidance().disclaimer }}</p>
    </section>
  `,
  styles: [`
    .guide { background: linear-gradient(180deg, #fbf1ee, var(--card)); border: 1px solid #e6c7c0; border-left: 4px solid var(--risk); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 14px; }
    .top { display: flex; gap: 14px; align-items: center; }
    .mark { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--risk-wash); color: var(--risk); flex-shrink: 0; }
    .message { font-size: 1.05rem; }
    .actions { margin: 0; padding-left: 22px; display: flex; flex-direction: column; gap: 6px; }
    .resources ul { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 8px; }
    .resources li { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 14px; background: #fffdf9; border: 1px solid var(--line-soft); border-radius: var(--radius-sm); }
    .name { color: var(--ink-soft); }
    .value { font-size: 1.05rem; font-variant-numeric: tabular-nums; }
    .resources a { display: inline-flex; gap: 4px; align-items: center; overflow-wrap: anywhere; }
    .fallback { font-weight: 500; }
  `],
})
export class SafetyGuidanceComponent {
  readonly guidance = input.required<SafetyGuidance>();
  readonly heading = input('No tienes que atravesar esto a solas');
  protected readonly resources = computed(() =>
    Object.entries(this.guidance().resources ?? {}).map(([name, value]) => ({ name, value, link: isSafeUrl(value) })));
}
