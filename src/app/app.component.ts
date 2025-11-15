import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';
import { CommonModule } from '@angular/common';
import { AppNameService } from './core/services/app-name.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationToastComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Monasabat';

  showThemePicker = false;

  colorThemes = [
    {
      name: 'Classic Gold',
      preview: 'linear-gradient(90deg, #cba135 60%, #fff 100%)',
      vars: {
        '--accent-gold': '#cba135',
        '--accent-gold-hover': '#b8942e',
        '--accent-gold-light': '#e6d4a3',
        '--primary-white': '#fff',
        '--primary-dark': '#2c2c2c',
      },
    },
    {
      name: 'Royal Blue',
      preview: 'linear-gradient(90deg, #1e3a8a 60%, #e0e7ef 100%)',
      vars: {
        '--accent-gold': '#1e3a8a',
        '--accent-gold-hover': '#274690',
        '--accent-gold-light': '#e0e7ef',
        '--primary-white': '#fff',
        '--primary-dark': '#1e293b',
      },
    },
    {
      name: 'Emerald Nature',
      preview: 'linear-gradient(90deg, #10b981 60%, #f0fdf4 100%)',
      vars: {
        '--accent-gold': '#10b981',
        '--accent-gold-hover': '#059669',
        '--accent-gold-light': '#f0fdf4',
        '--primary-white': '#fff',
        '--primary-dark': '#134e4a',
      },
    },
    {
      name: 'Rose & Purple',
      preview: 'linear-gradient(90deg, #e11d48 60%, #a21caf 100%)',
      vars: {
        '--accent-gold': '#e11d48',
        '--accent-gold-hover': '#a21caf',
        '--accent-gold-light': '#fdf2f8',
        '--primary-white': '#fff',
        '--primary-dark': '#2c2c2c',
      },
    },
    {
      name: 'DJ Neon',
      preview: 'linear-gradient(90deg, #f59e42 0%, #3b82f6 50%, #e11d48 100%)',
      vars: {
        '--accent-gold': '#e11d48',
        '--accent-gold-hover': '#3b82f6',
        '--accent-gold-light': '#f59e42',
        '--primary-white': '#fff',
        '--primary-dark': '#18181b',
      },
    },
  ];

  constructor(private appNameService: AppNameService) {
    // Initialize translated application name and title handling
    this.appNameService.init();
    // Load theme from localStorage if exists
    const saved = localStorage.getItem('app-theme');
    if (saved) {
      try {
        const theme = JSON.parse(saved);
        this.applyTheme(theme, false);
      } catch {}
    }
  }

  applyTheme(theme: any, persist = true) {
    Object.entries(theme.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string);
    });
    if (persist) {
      localStorage.setItem('app-theme', JSON.stringify(theme));
    }
    this.showThemePicker = false;
  }
}
