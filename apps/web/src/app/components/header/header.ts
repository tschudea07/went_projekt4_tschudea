import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { IsActiveMatchOptions, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

type NavItem = {
  label: string;
  path: string;
  description: string;
};

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  protected readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  protected readonly isMenuOpen = signal(false);

  protected readonly activeRouteOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  protected readonly brandRoute = computed(() =>
    this.authSession.isAuthenticated() ? '/projects' : '/login',
  );

  protected readonly navItems = computed<NavItem[]>(() => {
    if (this.authSession.isAuthenticated()) {
      return [
        {
          label: 'Projects',
          path: '/projects',
          description: 'Projektübersicht',
        },
        {
          label: 'Create Project',
          path: '/create-project',
          description: 'Projekt anlegen',
        },
      ];
    }

    return [
      {
        label: 'Login',
        path: '/login',
        description: 'Einloggen',
      },
      {
        label: 'Signup',
        path: '/signup',
        description: 'Konto erstellen',
      },
    ];
  });

  ngOnInit() {
    void this.authSession.refresh();
  }

  protected async signOut() {
    await this.authSession.signOut();
    this.closeMenu();
    await this.router.navigate(['/login']);
  }

  protected toggleMenu() {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu() {
    this.isMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeMenuWithEscape() {
    this.closeMenu();
  }
}
