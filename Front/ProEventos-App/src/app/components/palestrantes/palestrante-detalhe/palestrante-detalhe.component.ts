import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Palestrante } from '@app/models/Palestrante';
import { PalestranteService } from '@app/services/palestrante.service';
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-palestrante-detalhe',
  templateUrl: './palestrante-detalhe.component.html',
  styleUrls: ['./palestrante-detalhe.component.scss']
})
export class PalestranteDetalheComponent implements OnInit {

  public form!: FormGroup;
  public situacaoDoForm = '';
  public corDaDescricao = '';

  constructor(
    private fb: FormBuilder,
    public palestranteService: PalestranteService
  ) { }

  ngOnInit() {
    this.validation();
    this.verificaForm();
    this.loadSpeaker();
  }

  private loadSpeaker(): void {
    this.palestranteService.getPalestrante().subscribe(
      (palestrante: Palestrante) => {
        this.form.patchValue(palestrante);
      }
    )
  }

  private validation(): void {
    this.form = this.fb.group({
      miniCurriculo: ['']
    })
  }

  public get f(): any {
    return this.form.controls;
  }

  private verificaForm(): void {
    this.form.valueChanges
    .pipe(
      map(() => {
        this.situacaoDoForm = 'Minicurriculo está sendo atualizado!';
        this.corDaDescricao = 'text-warning';
      }),
      debounceTime(1000)
    ).subscribe(
      () => {
        this.palestranteService
          .put({...this.form.value})
          .subscribe(() => {
            this.situacaoDoForm = 'Minicurriculo foi atualizado!';
            this.corDaDescricao = 'text-success';

            setTimeout(() => {
              this.situacaoDoForm = 'Minicurriculo foi carregado!';
              this.corDaDescricao = 'text-muted';

            }, 2000)
          },
          (error) => {
              console.log(error);
          }
        );
      }
    )
  }
}
