import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-picker" role="radiogroup" aria-label="Rating">
      <button
        *ngFor="let s of stars"
        type="button"
        class="star-btn"
        [class.filled]="(hoverValue || value) >= s"
        (click)="select(s)"
        (mouseover)="setHover(s)"
        (mouseleave)="setHover(0)"
        [attr.aria-checked]="value === s"
        [disabled]="readonly"
      >
        <span class="visually-hidden">Rate {{ s }} out of 5</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            [attr.fill]="(hoverValue || value) >= s ? '#f5a623' : 'none'"
            stroke="#f5a623"
            stroke-width="1.2"
            d="M12 .587l3.668 7.431L23.5 9.748l-5.75 5.602L19.335 24 12 20.041 4.665 24l1.585-8.65L.5 9.748l7.832-1.73L12 .587z"
          />
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      .star-picker {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .star-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 2px;
      }
      .star-btn svg {
        display: block;
      }
      .star-btn:disabled {
        cursor: default;
        opacity: 0.8;
      }
      .star-btn.filled svg path {
        fill: #f5a623;
      }
    `,
  ],
})
export class StarPickerComponent {
  @Input() value = 0; // current value 0-5
  @Input() readonly = false;
  @Output() rate = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5];
  hoverValue = 0;

  setHover(v: number) {
    if (this.readonly) return;
    this.hoverValue = v;
  }

  select(v: number) {
    if (this.readonly) return;
    this.value = v;
    this.rate.emit(this.value);
  }
}
