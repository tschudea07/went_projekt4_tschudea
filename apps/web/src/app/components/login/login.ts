import { Component, signal } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';

import { loginSchema, type LoginType } from '@lib/schemas/user.schema';
import { authClient } from '@lib/auth-client';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  templateUrl: './login.html',
})
export class Login {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const verificationError = this.route.snapshot.queryParamMap.get('error');

    if (verificationError) {
      this.error.set('The verification link is invalid or expired.');
      return;
    }

    if (this.route.snapshot.queryParamMap.get('verified') === '1') {
      this.message.set('Your email address is verified. You can log in now.');
      return;
    }

    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.message.set('Check your inbox and verify your email before logging in.');
    }
  }

  formData = signal<LoginType>({
    email: '',
    password: '',
  });

  error = signal<string>('');
  message = signal<string>('');

  form = form(this.formData, (schemaPath) => {
    validateStandardSchema(schemaPath, loginSchema);
  });

  async onSubmit(event: Event) {
    event.preventDefault();

    this.error.set('');

    if (this.form().invalid()) {
      return;
    }

    const result = await authClient.signIn.email({
      email: this.formData().email,
      password: this.formData().password,
      callbackURL: `${window.location.origin}/login?verified=1`,
    });

    if (result.error) {
      if (result.error.status === 403) {
        this.error.set('Please verify your email address. We sent you a new verification link.');
        return;
      }

      this.error.set(result.error.message || 'Unkown Error. Please try again later.');
      return;
    }

    await this.router.navigate(['/home']);
  }
}
