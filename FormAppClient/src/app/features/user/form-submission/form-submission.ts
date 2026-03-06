import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormsService } from '../../../core/services/forms';
import { SubmissionsService } from '../../../core/services/submissions';
import { AppForm, FormField } from '../../../core/models/form.model';

@Component({
  selector: 'app-form-submission',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-submission.html',
  styleUrl: './form-submission.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSubmission implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formsService = inject(FormsService);
  private submissionsService = inject(SubmissionsService);

  form = signal<AppForm | null>(null);
  answers = signal<Record<number, string>>({});
  isLoading = signal(true);
  isSubmitting = signal(false);
  isSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const formId = Number(this.route.snapshot.paramMap.get('formId'));
    if (!formId) { this.router.navigate(['/dashboard']); return; }

    this.formsService.getFormById(formId).subscribe({
      next: (form) => {
        this.form.set(form);
        // Initialize all answers as empty strings
        const initial: Record<number, string> = {};
        form.fields.forEach(f => initial[f.id] = f.fieldType === 'checkbox' ? 'false' : '');
        this.answers.set(initial);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Form not found.');
        this.isLoading.set(false);
      }
    });
  }

  getAnswer(fieldId: number): string {
    return this.answers()[fieldId] ?? '';
  }

  setAnswer(fieldId: number, value: string): void {
    this.answers.update(a => ({ ...a, [fieldId]: value }));
  }

  toggleCheckbox(fieldId: number): void {
    const current = this.answers()[fieldId] === 'true';
    this.setAnswer(fieldId, String(!current));
  }

  getOptions(field: FormField): string[] {
    if (!field.options) return [];
    try { return JSON.parse(field.options); }
    catch { return field.options.split(',').map(o => o.trim()); }
  }

  isValid(): boolean {
    const form = this.form();
    if (!form) return false;
    return form.fields
      .filter(f => f.isRequired)
      .every(f => {
        const val = this.answers()[f.id];
        return val !== undefined && val !== '' && val !== 'false';
      });
  }

  submit(): void {
    if (!this.isValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formId = this.form()!.id;
    const payload = {
      answers: Object.entries(this.answers()).map(([fieldId, value]) => ({
        fieldId: Number(fieldId),
        value
      }))
    };

    this.submissionsService.submitForm(formId, payload).subscribe({
      next: () => this.isSuccess.set(true),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Submission failed.');
        this.isSubmitting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
