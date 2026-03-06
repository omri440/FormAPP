import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionsService } from '../../../core/services/submissions';
import { Submission } from '../../../core/models/submission.model';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Analytics implements OnInit {
  private submissionsService = inject(SubmissionsService);

  submissions = signal<Submission[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  formCounts = computed(() => {
    const map = new Map<string, number>();
    for (const s of this.submissions()) {
      map.set(s.formTitle, (map.get(s.formTitle) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([formTitle, count]) => ({ formTitle, count }))
      .sort((a, b) => b.count - a.count);
  });

  maxCount = computed(() => Math.max(0, ...this.formCounts().map(c => c.count)));

  ngOnInit(): void {
    this.submissionsService.getSubmissions().subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load analytics.');
        this.isLoading.set(false);
      }
    });
  }
}
