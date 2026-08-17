import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  tenantId: string;
}

const oAuthConfig: AuthConfig = {
  issuer: 'http://localhost:8080/realms/fleetbridge-master',
  redirectUri: window.location.origin + '/dashboard',
  clientId: 'fleetbridge-web',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false // For local development only
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSignal = signal<AuthUser | null>(null);
  
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly userRoles = computed(() => this.currentUserSignal()?.roles ?? []);

  public initialAuthResolver!: Promise<boolean>;

  constructor(private oauthService: OAuthService, private router: Router) {
    this.initialAuthResolver = this.initAuth();
  }

  private async initAuth(): Promise<boolean> {
    this.oauthService.configure(oAuthConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      if (this.oauthService.hasValidAccessToken()) {
        this.loadUserProfile();
        return true;
      }
    } catch (err) {
      console.error('OAuth configuration failed', err);
    }
    return false;
  }

  public login(): void {
    this.oauthService.initCodeFlow();
  }

  public logout(): void {
    this.oauthService.logOut();
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  public getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  private loadUserProfile(): void {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims) return;
    
    // Extract roles from Keycloak JWT payload format (from Access Token)
    let roles: string[] = [];
    const accessToken = this.oauthService.getAccessToken();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (payload.realm_access && payload.realm_access.roles) {
          roles = payload.realm_access.roles;
        }
      } catch (e) {
        console.error('Failed to parse access token', e);
      }
    } else if (claims.realm_access && claims.realm_access.roles) {
      roles = claims.realm_access.roles;
    }

    const user: AuthUser = {
      id: claims.sub,
      email: claims.email,
      name: claims.preferred_username || claims.name || claims.email || 'User',
      roles: roles,
      tenantId: 'default-tenant' // Ideally parsed from custom claim
    };

    this.currentUserSignal.set(user);
  }
}
