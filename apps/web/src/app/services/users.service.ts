import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type CreateUserRequest = {
  id: string;
  name: string;
  email: string;
};

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = 'http://localhost:3000/users';

    createUser(user: CreateUserRequest) {
      return this.http.post(this.usersUrl, user, {
        withCredentials: true,
      });
  } 
}
