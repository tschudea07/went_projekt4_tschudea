import { Component, signal } from '@angular/core';
import {
  form,
  FormField,
  validateStandardSchema,
} from '@angular/forms/signals';

import { loginSchema , type LoginType} from '@operon/shared';
import { authClient } from '@lib/auth-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  templateUrl: './login.html',
})
export class Login {

loginModel = signal<LoginType>({
    email: '',
    password: '',
});

  form = form(this.loginModel, (schemaPath) => {
    validateStandardSchema(schemaPath, loginSchema);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    authClient.signIn.email({
      email: this.form().value().email ,
      password: this.form().value().password
    })
  }
}