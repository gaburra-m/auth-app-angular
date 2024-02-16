import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environments';
import { AuthStatus, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _baseUrl: string = environment.baseUrl;
  private _http = inject(HttpClient);

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);

  public currentUser = computed(() => this._currentUser()); //para no modificar el privado
  public authStatus = computed(() => this._authStatus()); //para no modificar el privado

  constructor() {}

  login(email: string, password: string): Observable<boolean> {
    const url = `${this._baseUrl}/auth/login`;
    const body = { email, password };

    return this._http.post<LoginResponse>(url, body).pipe(
      tap(({ user, token }) => {
        this._currentUser.set(user);
        this._authStatus.set(AuthStatus.authenticated);
        localStorage.setItem('token', token);
        console.log({ user, token });
      }),
      map(() => true),

      //TODO: errores
      catchError((err) => throwError(() => err.error.message))
    );
  }
}
