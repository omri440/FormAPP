import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsService } from '../../../core/services/forms';
import { AppForm } from '../../../core/models/form.model';

@Component({
  selector: 'app-forms-list',
  imports: [CommonModule],
  templateUrl: './forms-list.html',
  styleUrl: './forms-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsList implements OnInit {
  private formsService = inject(FormsService);
  private router = inject(Router);

  forms = signal<AppForm[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading.set(true);
    this.formsService.getForms().subscribe({
      next: (data) => {
        this.forms.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load forms.');
        this.isLoading.set(false);
      }
    });
  }

  createForm(): void {
    this.router.navigate(['/admin/form-builder']);
  }

  deleteForm(id: number, event: Event): void {
    event.stopPropagation();
    if (!confirm('Delete this form? All submissions will also be deleted.')) return;

    this.formsService.deleteForm(id).subscribe({
      next: () => this.forms.update(forms => forms.filter(f => f.id !== id)),
      error: () => this.errorMessage.set('Failed to delete form.')
    });
  }
}
