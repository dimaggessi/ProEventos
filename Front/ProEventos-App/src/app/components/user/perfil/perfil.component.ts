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

  user = {} as UserUpdate;

  public get isSpeaker(): boolean {
    return this.user.funcao === 'Palestrante'
  };

  constructor() { }

  ngOnInit(): void { }

  public setFormValue(user: UserUpdate): void {
    this.user = user;
  }
}
