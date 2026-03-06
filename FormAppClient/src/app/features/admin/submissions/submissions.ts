import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionsService } from '../../../core/services/submissions';
import { Submission } from '../../../core/models/submission.model';

@Component({
  selector: 'app-submissions',
  imports: [CommonModule, FormsModule],
  templateUrl: './submissions.html',
  styleUrl: './submissions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Submissions implements OnInit {
  private submissionsService = inject(SubmissionsService);

  submissions = signal<Submission[]>([]);
  selectedSubmission = signal<Submission | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  searchUser = signal('');
  searchForm = signal('');
  isExporting = signal(false);
  isExportingJson = signal(false);

  // Stats
  totalCount = computed(() => this.submissions().length);
  uniqueUsers = computed(() => new Set(this.submissions().map(s => s.submittedByEmail)).size);
  uniqueForms = computed(() => new Set(this.submissions().map(s => s.formTitle)).size);

  // Filtered list — reacts to both search signals
  filtered = computed(() => {
    const user = this.searchUser().toLowerCase().trim();
    const form = this.searchForm().toLowerCase().trim();
    return this.submissions().filter(s =>
      (!user || s.submittedByEmail.toLowerCase().includes(user)) &&
      (!form || s.formTitle.toLowerCase().includes(form))
    );
  });

  ngOnInit(): void {
    this.submissionsService.getSubmissions().subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load submissions.');
        this.isLoading.set(false);
      }
    });
  }

  getInitials(email: string): string {
    return email.slice(0, 2).toUpperCase();
  }

  getAvatarColor(email: string): string {
    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  }

  selectSubmission(submission: Submission): void {
    this.selectedSubmission.set(submission);
  }

  closeDetail(): void {
    this.selectedSubmission.set(null);
  }

  clearSearch(): void {
    this.searchUser.set('');
    this.searchForm.set('');
  }

  exportExcel(): void {
    if (this.isExporting()) return;

    this.isExporting.set(true);
    this.errorMessage.set(null);

    this.submissionsService.exportSubmissionsExcel().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'submissions.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to export submissions.');
        this.isExporting.set(false);
      }
    });
  }

  exportJson(): void {
    if (this.isExportingJson()) return;

    this.isExportingJson.set(true);
    const data = this.submissions();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.json';
    a.click();
    URL.revokeObjectURL(url);

    this.isExportingJson.set(false);
  }
}
