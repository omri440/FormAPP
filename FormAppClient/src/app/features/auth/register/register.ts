import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  const errors: ValidationErrors = {};

  if (val.length < 8)                          errors['minLength']    = true;
  if (!/[A-Z]/.test(val))                      errors['uppercase']    = true;
  if (!/[a-z]/.test(val))                      errors['lowercase']    = true;
  if (!/[0-9]/.test(val))                      errors['number']       = true;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(val))    errors['specialChar']  = true;

  return Object.keys(errors).length ? errors : null;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private auth = inject(Auth);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, strongPasswordValidator]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  loading = signal(false);
  errorMessage = signal('');

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }
  get passwordMismatch() { return this.form.errors?.['passwordMismatch'] && this.confirmPassword.touched; }

  passwordValue = toSignal(this.password.valueChanges, { initialValue: '' });

  passwordRules = computed(() => {
    const val = this.passwordValue() ?? '';
    return {
      minLength:   val.length >= 8,
      uppercase:   /[A-Z]/.test(val),
      lowercase:   /[a-z]/.test(val),
      number:      /[0-9]/.test(val),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(val),
    };
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password, confirmPassword } = this.form.getRawValue();

    this.auth.register({ email: email!, password: password!, confirmPassword: confirmPassword! }).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Registration failed. Please try again.');
      }
    });
  }
}
