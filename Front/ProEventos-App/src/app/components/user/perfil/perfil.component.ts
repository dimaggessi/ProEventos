import { Component, OnInit } from '@angular/core';
import { UserUpdate } from '@app/models/Identity/UserUpdate';
import { UserService } from '@app/services/user.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {


  user = {} as UserUpdate;
  public imagemURL = '';
  public file: File;

  public get isSpeaker(): boolean {
    return this.user.funcao === 'Palestrante'
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void { }

  public setFormValue(user: UserUpdate): void {
    this.user = user;
    if (this.user.imagemURL)
      this.imagemURL = environment.apiURL + `resources/perfil/${this.user.imagemURL}`;
    else
      this.imagemURL = './assets/img/perfil.jpg';
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files;

    reader.readAsDataURL(this.file[0]);

    this.uploadImage();
  }

  private uploadImage(): void {
    this.userService
      .postUpload(this.file)
      .subscribe();
  }
}
