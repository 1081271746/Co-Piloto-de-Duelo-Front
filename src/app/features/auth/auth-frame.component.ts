import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BrandComponent } from '../../layout/brand.component';

@Component({
  selector: 'app-auth-frame',
  imports: [BrandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame">
      <aside class="art" aria-hidden="true">
        <app-brand />
        <svg class="scene" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="320" fill="url(#sky)" />
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#4d5b85" />
              <stop offset=".7" stop-color="#9a7088" />
              <stop offset="1" stop-color="#e2b88a" />
            </linearGradient>
          </defs>
          <circle cx="270" cy="150" r="38" fill="#f6e8d6" opacity=".92" />
          <path d="M0 230 C 80 210, 140 250, 220 228 S 340 210, 400 228 V320 H0z" fill="#3a4569" opacity=".55" />
          <path d="M0 262 C 70 248, 160 280, 240 262 S 350 250, 400 262 V320 H0z" fill="#2c2b3a" opacity=".55" />
          <path d="M40 292 h120 M190 300 h90" stroke="#f6e8d6" stroke-width="1.2" opacity=".35" />
        </svg>
        <blockquote>
          <p>Un lugar para escribir lo que todavía no tiene nombre.</p>
          <span>Sin prisa. Sin metas. Solo tuyo.</span>
        </blockquote>
      </aside>
      <main class="panel">
        <div class="inner"><ng-content /></div>
      </main>
    </div>
  `,
  styles: [`
    .frame { min-height: 100dvh; display: grid; grid-template-columns: minmax(320px, 1fr) minmax(360px, 560px); }
    .art { position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: 36px; overflow: hidden; background: #3a4569; }
    .art app-brand { position: relative; z-index: 1; background: rgba(244, 239, 230, .9); padding: 8px 14px; border-radius: 999px; align-self: flex-start; }
    .scene { position: absolute; inset: 0; width: 100%; height: 100%; }
    blockquote { position: relative; margin: 0; color: #f6efe4; max-width: 420px; }
    blockquote p { font-family: var(--font-display); font-size: clamp(1.4rem, 2.4vw, 2rem); line-height: 1.3; }
    blockquote span { display: block; margin-top: 10px; opacity: .85; }
    .panel { display: flex; align-items: center; justify-content: center; padding: 40px 28px; }
    .inner { width: 100%; max-width: 420px; }
    @media (max-width: 860px) {
      .frame { grid-template-columns: 1fr; }
      .art { min-height: 220px; padding: 22px; }
      blockquote p { font-size: 1.3rem; }
    }
  `],
})
export class AuthFrameComponent {}
