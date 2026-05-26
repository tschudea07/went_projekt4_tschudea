import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthSessionService } from './services/auth-session.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {
          provide: AuthSessionService,
          useValue: {
            isAuthenticated: signal(false),
            refresh: () => Promise.resolve(false),
            signOut: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the primary navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(compiled.querySelectorAll('nav a')).map((link) =>
      link.textContent?.trim(),
    );

    expect(links).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Login'),
        expect.stringContaining('Signup'),
      ]),
    );
  });
});
