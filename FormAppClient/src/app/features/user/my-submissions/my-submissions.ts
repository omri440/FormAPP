import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SubmissionsService } from '../../../core/services/submissions';
import { Submission } from '../../../core/models/submission.model';

@Component({
  selector: 'app-my-submissions',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './my-submissions.html',
  styleUrl: './my-submissions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MySubmissions implements OnInit {
  private submissionsService = inject(SubmissionsService);

  submissions = signal<Submission[]>([]);
  isLoading = signal(true);
  expandedId = signal<number | null>(null);

  // Stats
  totalCount = computed(() => this.submissions().length);
  uniqueForms = computed(() => new Set(this.submissions().map(s => s.formId)).size);

  ngOnInit(): void {
    this.submissionsService.getMySubmissions().subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleExpand(id: number): void {
    this.expandedId.update(current => (current === id ? null : id));
  }

  isExpanded(id: number): boolean {
    return this.expandedId() === id;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatValue(value: string, fieldType: string): string {
    if (fieldType === 'checkbox') return value === 'true' ? '✅ Yes' : '❌ No';
    return value || '—';
  }
}
