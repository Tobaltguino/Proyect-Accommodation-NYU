import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly rutPattern =
    /^(?:\d{7,8}-[\dkK]|\d{1,2}\.\d{3}\.\d{3}-[\dkK])$/;

  errorMessage = '';
  isSubmitting = false;

  readonly loginForm = this.formBuilder.nonNullable.group({
    rut: ['', [Validators.required, Validators.pattern(this.rutPattern)]],
    password: ['', [Validators.required]],
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser?.role === 'ADMIN') {
      void this.router.navigate(['/admin/home']);
      return;
    }

    if (currentUser?.role === 'STUDENT') {
      void this.router.navigate(['/student/home']);
    }
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const { rut, password } = this.loginForm.getRawValue();

    this.authService
      .login({
        rut: this.normalizeRut(rut),
        password,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: ({ user }) => {
          if (user.role === 'ADMIN') {
            void this.router.navigate(['/admin/home']);
            return;
          }

          void this.router.navigate(['/student/home']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.errorMessage =
              'Formato de login invalido. Verifica RUT y contrasena.';
            return;
          }

          if (error.status === 401) {
            this.errorMessage = 'Credenciales invalidas. Intenta nuevamente.';
            return;
          }

          this.errorMessage =
            'Servidor no disponible. Intenta nuevamente en unos minutos.';
        },
      });
  }

  private normalizeRut(rut: string): string {
    return rut.replace(/\./g, '').toUpperCase();
  }
}
