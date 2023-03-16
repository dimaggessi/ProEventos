import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValidatorField } from '@app/helpers/ValidatorField';
import { User } from '@app/models/Identity/User';
import { UserUpdate } from '@app/models/Identity/UserUpdate';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-perfil-detalhe',
  templateUrl: './perfil-detalhe.component.html',
  styleUrls: ['./perfil-detalhe.component.scss']
})
export class PerfilDetalheComponent implements OnInit {

  @Output() changeFormValue = new EventEmitter();

  userUpdate = {} as UserUpdate;
  form!: FormGroup;

  constructor(
    public fb: FormBuilder,
    public userService: UserService,
    private router: Router
    // private toaster: ToastrService
  ) { }

  ngOnInit() {
    this.validation();
    this.loadUser();
    this.formVerify();
   }

  private formVerify(): void {
    this.form.valueChanges
      .subscribe(() => this.changeFormValue.emit({...this.form.value}) )
  }

  private loadUser(): void {
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

  get f(): any { return this.form.controls; }

  onSubmit(): void {
    this.userRefresh();
  }

  public userRefresh() {
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
