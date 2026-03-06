import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsService } from '../../../core/services/forms';
import { FieldType } from '../../../core/models/form.model';

@Component({
  selector: 'app-form-builder',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilderComponent {
  private fb = inject(FormBuilder);
  private formsService = inject(FormsService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  draggingIndex: number | null = null;
  dragOverIndex: number | null = null;

  readonly fieldTypes: FieldType[] = ['text', 'number', 'textarea', 'select', 'checkbox'];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    fields: this.fb.array([this.createField()])
  });

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  getFieldGroup(index: number): FormGroup {
    return this.fields.at(index) as FormGroup;
  }

  createField(): FormGroup {
    return this.fb.group({
      label: ['', [Validators.required, Validators.maxLength(300)]],
      fieldType: ['text', Validators.required],
      isRequired: [false],
      options: ['']
    });
  }

  addField(): void {
    this.fields.push(this.createField());
  }

  removeField(index: number): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(index);
    }
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    this.moveField(index, index - 1);
  }

  moveDown(index: number): void {
    if (index >= this.fields.length - 1) return;
    this.moveField(index, index + 1);
  }

  isSelectType(index: number): boolean {
    return this.getFieldGroup(index).get('fieldType')?.value === 'select';
  }

  onDragStart(index: number, event: DragEvent): void {
    this.draggingIndex = index;
    event.dataTransfer?.setData('text/plain', String(index));
    event.dataTransfer?.setDragImage((event.currentTarget as HTMLElement) ?? new Image(), 0, 0);
  }

  onDragEnter(index: number): void {
    if (this.draggingIndex === null) return;
    this.dragOverIndex = index;
  }

  onDragLeave(index: number): void {
    if (this.dragOverIndex === index) {
      this.dragOverIndex = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(index: number): void {
    if (this.draggingIndex === null || this.draggingIndex === index) {
      this.resetDragState();
      return;
    }

    this.moveField(this.draggingIndex, index);
    this.resetDragState();
  }

  onDragEnd(): void {
    this.resetDragState();
  }

  private resetDragState(): void {
    this.draggingIndex = null;
    this.dragOverIndex = null;
  }

  private moveField(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;

    const control = this.fields.at(fromIndex);
    this.fields.removeAt(fromIndex);
    this.fields.insert(toIndex, control);

    this.fields.markAsDirty();
    this.fields.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    const payload = {
      title: value.title!,
      description: value.description ?? '',
      fields: value.fields!.map((f: any, i: number) => ({
        label: f.label,
        fieldType: f.fieldType as FieldType,
        isRequired: f.isRequired,
        order: i,
        options: f.fieldType === 'select' ? f.options : undefined
      }))
    };

    this.formsService.createForm(payload).subscribe({
      next: () => this.router.navigate(['/admin/forms']),
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to create form.');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/forms']);
  }
}
