import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { User } from '@app/models/Identity/User';
import { UserService } from '@app/services/user.service';
import { catchError, take } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser: User;

    this.userService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      currentUser = user

      if (currentUser) {
        request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${currentUser.token}`
            }
          }
        );
      }
    });

    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          localStorage.removeItem('user')
        }

        return throwError(error);
      })
    );
  }
}
