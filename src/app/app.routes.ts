import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { AdminGuard } from './core/guards/admin.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ViewServiceComponent } from './features/view-service/view-service.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'login',
        component: AuthComponent,
        title: 'Login | Lamitna',
      },
      {
        path: 'register',
        component: AuthComponent,
        title: 'Register | Lamitna',
      },
      {
        path: 'search-results',
        loadComponent: () =>
          import('./features/search-result/search-result.component').then(
            (m) => m.SearchResultComponent
          ),
      },
      {
        path: 'service/:id',
        loadComponent: () =>
          import('./features/search-details/service-details.component').then(
            (m) => m.ServiceDetailComponent
          ),
      },
      {
        path: 'booking/:id',
        loadComponent: () =>
          import('./features/booking-form/booking-form.component').then(
            (m) => m.BookingFormComponent
          ),
      },
      {
        path: 'client-dashboard',
        loadComponent: () =>
          import('./features/client-dashboard/client-dashboard.component').then(
            (m) => m.ClientDashboardComponent
          ),
        canActivate: [RoleGuard],
        data: { role: 'client' },
      },
      {
        path: 'join',
        loadComponent: () =>
          import('./features/join/join.component').then((m) => m.JoinComponent),
        title: 'Join Our Network',
      },
      {
        path: 'supplier-dashboard',
        loadComponent: () =>
          import(
            './features/supplier-dashboard/supplier-dashboard.component'
          ).then((m) => m.SupplierDashboardComponent),
        canActivate: [RoleGuard],
        data: { role: 'supplier' },
        title: 'Supplier Dashboard',
      },
      // {
      //   path: 'add-service',
      //   loadComponent: () =>
      //     import('./features/add-service/add-service.component').then(
      //       (m) => m.AddServiceComponent
      //     ),
      //   title: 'Add New Service'
      // }

      {
        path: 'supplier/add-service',
        loadComponent: () =>
          import('./features/add-service/add-service.component').then(
            (m) => m.AddServiceComponent
          ),
      },
      {
        path: 'supplier/edit-service/:id',
        loadComponent: () =>
          import('./features/edit-service/edit-service.component').then(
            (m) => m.EditServiceComponent
          ),
      },
      {
        path: 'admin-dashboard',
        loadComponent: () =>
          import('./features/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        canActivate: [AdminGuard, RoleGuard],
        data: { role: 'admin' },
      },
      {
        path: 'supplier/view-service/:id',
        component: ViewServiceComponent,
      },
      {
        path: 'chat/:userId',
        loadComponent: () =>
          import('./features/chat-page/chat-page.component').then(
            (c) => c.ChatPageComponent
          ),
      },
      {
        path: 'all-services',
        loadComponent: () =>
          import('./features/all-services/all-services.component').then(
            (m) => m.AllServicesComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then(
            (c) => c.AboutComponent
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then(
            (c) => c.ContactComponent
          ),
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./features/terms/terms.component').then(
            (c) => c.TermsComponent
          ),
      },
      {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/notfound/notfound.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
