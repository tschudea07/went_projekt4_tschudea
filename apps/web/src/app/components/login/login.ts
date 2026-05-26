import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  validateStandardSchema,
} from '@angular/forms/signals';

import { loginSchema, type LoginType } from '@lib/schemas/user.schema';
import { authClient } from '@lib/auth-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  templateUrl: './login.html',
})

export class Login {
  
  constructor(private router: Router) {}

  formData = signal<LoginType>({
    email: '',
    password: '',
  });

  error = signal<string>('');

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
    });

    if (result.error) {
      this.error.set(result.error.message || "Unkown Error. Please try again later.");
      return;
    }

    await this.router.navigate(['/home']);
  }
}
