import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorField } from '@app/helpers/ValidatorField';
import { User } from '@app/models/Identity/User';
import { UserUpdate } from '@app/models/Identity/UserUpdate';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  userUpdate = {} as UserUpdate;
  form!: FormGroup;

  constructor(
    public fb: FormBuilder,
    public userService: UserService,
    private router: Router
    // private toaster: ToastrService
    ) { }

  get f(): any { return this.form.controls; }

  ngOnInit(): void {
    this.validation();
    this.carregarUsuário();
  }

  private carregarUsuário(): void {
    this.userService.getUser().subscribe(
      (userRetorno: UserUpdate) => {
        console.log(userRetorno);
        this.userUpdate = userRetorno;
        this.form.patchValue(this.userUpdate);
        // this.toaster.success('Usuário Carregado', 'Sucesso');
      },
      (error) => {
        console.error(error);
        // this.toaster.error('Usuário não cargado', 'Erro');
        this.router.navigate(['/dashboard']);
      }
    );
  }

  private validation(): void {

    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('password', 'confirmPassword')
    };

    this.form = this.fb.group({
      userName: [''],
      titulo: ['NaoInformado', Validators.required],
      funcao: ['NaoInformado', Validators.required],
      primeiroNome: ['', Validators.required],
      ultimoNome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      descricao: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required],
    }, formOptions);
  }

  onSubmit(): void {
    this.atualizarUsuario();
  }

  public atualizarUsuario() {
    this.userUpdate = {...this.form.value};
    this.userService.updateUser(this.userUpdate).subscribe(
      () => /*this.toaster.success('Usuário atualizado!', 'Sucesso')*/ {},
      (error) => {
        //this.toaster.error(error.error);
        console.error(error);
      }
    );
  }

  public resetForm() : void{
    this.form.reset();
  }
}
