import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import {
  LUCIDE_ICONS,
  LucideIconProvider,
  House,
  LayoutList,
  Plus,
  Inbox,
  ChartBar,
  LogOut,
  Search,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  CircleCheck,
  MailOpen,
  Users,
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        House,
        LayoutList,
        Plus,
        Inbox,
        ChartBar,
        LogOut,
        Search,
        X,
        GripVertical,
        ChevronUp,
        ChevronDown,
        ChevronLeft,
        ChevronRight,
        FileText,
        CircleCheck,
        MailOpen,
        Users,
      }),
    },
  ]
};
