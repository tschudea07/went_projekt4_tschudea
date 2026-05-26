import { Injectable, computed, signal } from '@angular/core';
import { authClient } from '@lib/auth-client';

type SessionResult = Awaited<ReturnType<typeof authClient.getSession>>;
type SessionData = NonNullable<SessionResult['data']>;

@Injectable({
  providedIn: 'root',
})

export class AuthSessionService {
  private readonly sessionData = signal<SessionData | null>(null);
  private readonly pending = signal(false);

  readonly session = this.sessionData.asReadonly();
  readonly isLoading = this.pending.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionData() !== null);

  async refresh() {
    this.pending.set(true);

    try {
      const result = await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });

      this.sessionData.set(result.data ?? null);
      return result.data !== null;
    } catch {
      this.sessionData.set(null);
      return false;
    } finally {
      this.pending.set(false);
    }
  }

  async signOut() {
    await authClient.signOut();
    this.sessionData.set(null);
  }
}
