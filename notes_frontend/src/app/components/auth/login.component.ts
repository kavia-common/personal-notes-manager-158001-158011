import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  error = '';
  form = new FormBuilder().group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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
    const { email, password } = this.form.value;
    try {
      this.auth.login(email!, password!);
      this.router.navigateByUrl('/');
    } catch (e: any) {
      this.error = e?.message || 'Login failed';
    }
  }
}
