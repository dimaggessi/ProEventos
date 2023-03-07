import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserLogin } from '@app/models/Identity/UserLogin';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model = {} as UserLogin;

  constructor(
    private userService: UserService,
    private router: Router
    ) {}

  ngOnInit(): void {}

  public login(): void {
    this.userService.login(this.model).subscribe(
      () => {
        this.router.navigateByUrl('/eventos/lista');
      },
      (error: any) => {
        if (error.status == 401)
          console.log('usuário ou senha inválidos');
        else console.error(error);
      }
    );
  }
}
