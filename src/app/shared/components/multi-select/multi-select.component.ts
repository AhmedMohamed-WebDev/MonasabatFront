import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="ms-root" #root>
      <button
        type="button"
        class="btn btn-outline-secondary ms-toggle compact"
        (click)="toggleDropdown($event)"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open"
      >
        <div class="ms-content">
          <ng-container
            *ngIf="selected && selected.length > 0; else placeholderTpl"
          >
            <span class="ms-chip" *ngFor="let s of selected">{{
              labelFor(s)
            }}</span>
          </ng-container>
          <ng-template #placeholderTpl>
            <span class="ms-placeholder">{{
              placeholder || 'search.filters.serviceTypes'
            }}</span>
          </ng-template>
        </div>
        <span class="ms-caret">▾</span>
      </button>

      <div class="ms-dropdown" *ngIf="open" role="listbox">
        <!-- Mobile bottom-sheet mode -->
        <ng-container *ngIf="mobileMode; else desktopList">
          <div class="ms-list ms-mobile-list">
            <h6 class="ms-mobile-title">
              {{ placeholder || 'search.filters.serviceTypes' }}
            </h6>
            <label class="ms-item ms-mobile-item" *ngFor="let opt of options">
              <input
                type="checkbox"
                [checked]="staged.includes(opt.value)"
                (change)="onToggle(opt.value, $event)"
              />
              <span class="ms-label">{{ opt.label }}</span>
            </label>
          </div>
          <div class="ms-mobile-actions">
            <button
              class="btn btn-outline-secondary me-2"
              (click)="cancelStaged()"
            >
              {{ 'common.cancel' | translate }}
            </button>
            <button class="btn btn-warning" (click)="applyStaged()">
              {{ 'common.apply' | translate }}
            </button>
          </div>
        </ng-container>

        <!-- Desktop inline list -->
        <ng-template #desktopList>
          <div class="ms-list">
            <label class="ms-item" *ngFor="let opt of options">
              <input
                type="checkbox"
                [checked]="selected.includes(opt.value)"
                (change)="onToggle(opt.value, $event)"
              />
              <span class="ms-label">{{ opt.label }}</span>
            </label>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .ms-root {
        position: relative;
        display: inline-block;
        width: 100%;
      }
      .ms-toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 6px 10px;
        font-size: 14px;
      }
      .ms-toggle.compact {
        padding: 6px 8px;
        font-size: 13px;
      }
      .ms-content {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        max-width: calc(100% - 28px);
      }
      .ms-caret {
        margin-left: 8px;
        font-size: 12px;
        color: #6c757d;
      }
      .ms-dropdown {
        position: absolute;
        z-index: 1200;
        background: white;
        border: 1px solid #ddd;
        width: 100%;
        max-height: 240px;
        overflow: auto;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        margin-top: 6px;
      }
      .ms-list {
        padding: 6px;
      }
      .ms-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        cursor: pointer;
        font-size: 13px;
      }
      .ms-item:hover {
        background: #f8f9fa;
      }
      .ms-chip {
        display: inline-block;
        background: #f1f3f5;
        color: #2c2c2c;
        padding: 4px 8px;
        border-radius: 16px;
        margin-right: 6px;
        margin-bottom: 4px;
        font-size: 12px;
      }
      .ms-placeholder {
        color: #6c757d;
        font-size: 13px;
      }

      /* Mobile: make dropdown act like a bottom sheet for easier tapping */
      @media (max-width: 576px) {
        .ms-toggle {
          padding: 8px 10px;
          font-size: 13px;
        }
        .ms-chip {
          font-size: 12px;
          padding: 6px 10px;
        }
        .ms-dropdown {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          top: auto;
          border-radius: 12px 12px 0 0;
          max-height: 50vh;
          margin: 0;
        }
        .ms-list {
          padding: 12px;
        }
        .ms-item {
          padding: 12px;
          font-size: 15px;
        }
        .ms-caret {
          display: none;
        }
      }
    `,
  ],
})
export class MultiSelectComponent {
  @Input() options: { value: string; label: string }[] = [];
  @Input() selected: string[] = [];
  @Input() placeholder?: string;
  @Output() selectedChange = new EventEmitter<string[]>();

  open = false;
  // Staged selection used on mobile bottom-sheet to allow Apply/Cancel
  staged: string[] = [];
  mobileMode = false;

  constructor(private host: ElementRef) {}

  toggleDropdown(e?: Event) {
    e?.stopPropagation();
    // decide mobile mode based on window width
    this.mobileMode = typeof window !== 'undefined' && window.innerWidth <= 576;
    if (this.mobileMode) {
      // open bottom sheet and copy current selection into staged buffer
      this.staged = Array.isArray(this.selected) ? [...this.selected] : [];
      this.open = true;
      return;
    }
    this.open = !this.open;
  }

  onToggle(value: string, event: Event) {
    event.stopPropagation();
    // In mobile mode toggle staged buffer, otherwise toggle live selection
    if (this.mobileMode) {
      const cur = Array.isArray(this.staged) ? [...this.staged] : [];
      const idx = cur.indexOf(value);
      if (idx === -1) cur.push(value);
      else cur.splice(idx, 1);
      this.staged = cur;
      return;
    }

    const cur = Array.isArray(this.selected) ? [...this.selected] : [];
    const idx = cur.indexOf(value);
    if (idx === -1) cur.push(value);
    else cur.splice(idx, 1);
    this.selected = cur;
    this.selectedChange.emit(this.selected);
  }

  labelFor(value: string) {
    const found = this.options.find((o) => o.value === value);
    return found ? found.label : value;
  }

  // Apply staged selection (mobile)
  applyStaged() {
    this.selected = Array.isArray(this.staged) ? [...this.staged] : [];
    this.selectedChange.emit(this.selected);
    this.open = false;
    this.mobileMode = false;
  }

  // Cancel staged selection (mobile)
  cancelStaged() {
    this.staged = [];
    this.open = false;
    this.mobileMode = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.host.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }
}
