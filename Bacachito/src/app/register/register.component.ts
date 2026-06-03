import { Component, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registroForm: FormGroup;
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.fb.group({
      usuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/)
      ]],
      confirmarPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmar = control.get('confirmarPassword')?.value;
    return password === confirmar ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registroForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.registroForm.value;

    const datosRegistro = {
      name: formValue.usuario,
      email: formValue.email,
      password: formValue.password,
      position: formValue.telefono
    };

    this.authService.register(datosRegistro).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo al login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
        } else {
          this.errorMessage.set('Error al crear la cuenta. Intenta más tarde.');
        }
      }
    });
  }
}
