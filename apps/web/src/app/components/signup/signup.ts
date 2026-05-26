import { Component, signal } from '@angular/core';
import { form, FormField, validateStandardSchema } from '@angular/forms/signals';

import { signUpSchema, type SignUpType } from '@lib/schemas/user.schema';
import { authClient } from '@lib/auth-client';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-signup',
  imports: [FormField],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  constructor(
    private router: Router,
    private usersService: UsersService,
  ) {}

  formData = signal<SignUpType>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      callbackURL: `${window.location.origin}/login?verified=1`,
    });

    if (result.error) {
      this.error.set(result.error.message || 'Unkown Error. Please try again later.');
      return;
    }

    try {
      await firstValueFrom(
        this.usersService.createUser({
          id: result.data.user.id,
          name: result.data.user.name,
          email: result.data.user.email,
        }),
      );
    } catch {
      this.error.set('Account was created, but saving the user profile failed.');
      return;
    }

    await this.router.navigate(['/login'], {
      queryParams: { registered: '1' },
    });
  }
}
