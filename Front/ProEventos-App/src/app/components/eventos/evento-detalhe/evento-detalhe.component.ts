import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EventoService } from '@app/services/evento.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DateTimeFormatPipe } from '@app/helpers/DateTimeFormat.pipe';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

import { Lote } from '@app/models/Lote';
import { Evento } from '@app/models/Evento';
import { LoteService } from '@app/services/lote.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {

  eventoId: number;
  modalRef?: BsModalRef;
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvarAtualizar: string = 'post';
  loteAtual = {id: 0, nome: '', indice: 0};
  imagemURL = 'assets/upload.jpg'
  file: File;

  get modoEditar(): boolean {
    return this.estadoSalvarAtualizar === 'put';
  }

  get teste(): FormControl {
    return this.form.get('evento') as FormControl;
  }

  get lotes(): FormArray {
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      isAnimated: true,
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-blue',
      showWeekNumbers: false,
    };
  }

  constructor(private fb: FormBuilder,
    private localeService: BsLocaleService,
    private activatedRouter: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    private eventoService: EventoService,
    private loteService: LoteService) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id');

    if (this.eventoId !== null && this.eventoId !== 0) {

      this.estadoSalvarAtualizar = 'put';

      this.eventoService
      .getEventoById(this.eventoId)
      .subscribe(
        (evento: Evento) => {
          this.evento = { ...evento }
          this.form.patchValue(this.evento);
          if (this.evento.imagemURL !== '')
          {
            this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
          }
          this.carregarLotes();
        },
        (error: any) => {
          console.log(error)
        },
        () => { },
      );
    }
  }

  ngOnInit(): void {
    this.carregarEvento();
    this.validation();
  }

  public validation(): void {
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      imagemURL: [''],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      lotes: this.fb.array([])
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
      quantidade: [lote.quantidade, Validators.required]
    });
  }

  public mudarValorDataLote(value: Date, indice: number, campo: string): void {
    this.lotes.value[indice][campo] = value;
  }

  public retornaTituloLote(nome: string): string {
    return nome === null || nome === ''
                ? 'Nome do lote'
                : nome;
  }

  public resetForm(): void {
    this.form.reset();
  }

  openModal(event: any, template: TemplateRef<any>) {
    event.stopPropagation();
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  openModalLote(event: any, template: TemplateRef<any>, indice: number) {
    event.stopPropagation();
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });

    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;
  }

  confirm(): void {
    this.modalRef?.hide();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return { 'is-invalid': campoForm.errors && campoForm.touched }
  }

  public salvarEvento(): void {
    if (this.form.valid) {
      this.evento =
        this.estadoSalvarAtualizar === 'post'
          ? { ...this.form.value }
          : { id: this.evento.id, ...this.form.value };

      this.eventoService[this.estadoSalvarAtualizar](this.evento).subscribe(
        (eventoRetorno: Evento) => {
          this.confirm();
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          console.error(error);
        },
        () => {}
      );
    }
  }

  public salvarLotes(): void {
    if (this.form.controls.lotes.valid) {
      this.loteService.saveLote(this.eventoId, this.form.value.lotes)
      .subscribe(
        () => {
          this.lotes.reset();
        },
        (error: any) => {
          console.log("erro ao tentar salvar lotes.")
        }
      )
    }
  }

  public carregarLotes(): void {
    this.loteService
      .getLotesByEventoId(this.eventoId)
      .subscribe(
        (lotesRetorno: Lote[]) => {
          lotesRetorno.forEach((lote) => {
            this.lotes.push(this.criarLote(lote));
          });
        },
        (error: any) => {
          console.error(error);
        }
      )
  }


  public removerLote(indice: number): void {

    this.lotes.removeAt(indice);
    this.modalRef.hide();
  }

  public confirmDeleteLote(indice: number): void {
    this.modalRef.hide();
  }

  declineDeleteLote(): void {
    this.modalRef.hide();
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files;
    reader.readAsDataURL(this.file[0]);

    this.uploadImage();
  }

  uploadImage(): void {
    this.eventoService.postUpload(this.eventoId, this.file)
      .subscribe(
        () => this.carregarEvento(),
        (error: any) => {console.log("erro ao salvar imagem")}
      );
  }
}
