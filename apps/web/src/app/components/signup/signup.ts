import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  validateStandardSchema,
} from '@angular/forms/signals';

import { signUpSchema, type SignUpType } from '@operon/shared';
import { authClient } from '@lib/auth-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})

export class Signup {
    constructor(private router: Router) {}

formData = signal<SignUpType>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
});

  error = signal<string>('');

  form = form(this.formData, (schemaPath) => {
    validateStandardSchema(schemaPath, signUpSchema);
  });

  async onSubmit(event: Event) {
    event.preventDefault();

    this.error.set('');

    if (this.form().invalid()) {
      return;
    }

    const result = await authClient.signUp.email({
      name: this.formData().name,
      email: this.formData().email,
      password: this.formData().password,
    });

    if (result.error) {
      this.error.set(result.error.message || "Unkown Error. Please try again later.");
      return;
    }

     await this.router.navigate(['/login']);
  }

}
