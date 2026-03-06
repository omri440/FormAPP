import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsService } from '../../../core/services/forms';
import { SubmissionsService } from '../../../core/services/submissions';
import { AppForm } from '../../../core/models/form.model';
import { Submission } from '../../../core/models/submission.model';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHome implements OnInit {
  private formsService = inject(FormsService);
  private submissionsService = inject(SubmissionsService);
  private router = inject(Router);

  forms = signal<AppForm[]>([]);
  submissions = signal<Submission[]>([]);
  isLoading = signal(true);

  totalForms = computed(() => this.forms().length);
  totalSubmissions = computed(() => this.submissions().length);
  uniqueUsers = computed(() => new Set(this.submissions().map(s => s.submittedByEmail)).size);

  recentForms = computed(() => this.forms().slice(0, 5));
  recentSubmissions = computed(() => this.submissions().slice(0, 5));

  ngOnInit(): void {
    let loaded = 0;
    const done = () => { if (++loaded === 2) this.isLoading.set(false); };

    this.formsService.getForms().subscribe({ next: d => { this.forms.set(d); done(); }, error: done });
    this.submissionsService.getSubmissions().subscribe({ next: d => { this.submissions.set(d); done(); }, error: done });
  }

  goToForms(): void { this.router.navigate(['/admin/forms']); }
  goToCreateForm(): void { this.router.navigate(['/admin/form-builder']); }
  goToSubmissions(): void { this.router.navigate(['/admin/submissions']); }

  getAvatarColor(email: string): string {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6'];
    return colors[email.charCodeAt(0) % colors.length];
  }
}
