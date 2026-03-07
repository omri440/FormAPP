import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Auth } from '../../core/services/auth';
import { FormsService } from '../../core/services/forms';
import { SubmissionsService } from '../../core/services/submissions';
import { AppForm } from '../../core/models/form.model';
import { Submission } from '../../core/models/submission.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private formsService = inject(FormsService);
  private submissionsService = inject(SubmissionsService);

  isAdmin = this.auth.currentUser()?.role === 'admin';
  forms = signal<AppForm[]>([]);
  mySubmissions = signal<Submission[]>([]);
  isLoading = signal(true);

  // Set of formIds the user has already submitted
  submittedFormIds = computed(() =>
    new Set(this.mySubmissions().map(s => s.formId))
  );

  ngOnInit(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
      return;
    }

    forkJoin({
      forms: this.formsService.getForms(),
      submissions: this.submissionsService.getMySubmissions().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ forms, submissions }) => {
        this.forms.set(forms);
        this.mySubmissions.set(submissions);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  hasSubmitted(formId: number): boolean {
    return this.submittedFormIds().has(formId);
  }

  openForm(formId: number): void {
    this.router.navigate(['/user/submit', formId]);
  }
}
