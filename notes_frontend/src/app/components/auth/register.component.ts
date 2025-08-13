import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  error = '';
  form = new FormBuilder().group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private router: Router;
  private auth: AuthService;

  constructor(router: Router, auth: AuthService) {
    this.router = router;
    this.auth = auth;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, displayName } = this.form.value;
    try {
      this.auth.register(email!, password!, displayName!);
      this.router.navigateByUrl('/');
    } catch (e: any) {
      this.error = e?.message || 'Registration failed';
    }
  }
}
