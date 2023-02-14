import { Component, OnInit, TemplateRef } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '@app/services/evento.service';
import { Evento } from '@app/models/Evento';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DateTimeFormatPipe } from '@app/helpers/DateTimeFormat.pipe';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { Lote } from '@app/models/Lote';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {

  modalRef?: BsModalRef;
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvarAtualizar: string = 'post';

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
      dateInputFormat: 'dd/MM/YYYY hh:mm a',
      containerClass: 'theme-blue',
      showWeekNumbers: false
    };
  }

  constructor(private fb: FormBuilder,
    private localeService: BsLocaleService,
    private router: ActivatedRoute,
    private modalService: BsModalService,
    private route: Router,
    private eventoService: EventoService) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    const eventoIdParam = this.router.snapshot.paramMap.get('id');

    if (eventoIdParam !== null) {

      this.estadoSalvarAtualizar = 'put';

      this.eventoService.getEventoById(+eventoIdParam).subscribe(
        (evento: Evento) => {
          this.evento = { ...evento }
          this.form.patchValue(this.evento);
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
      imagemURL: ['', Validators.required],
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

  public resetForm(): void {
    this.form.reset();
  }

  openModal(event: any, template: TemplateRef<any>) {
    event.stopPropagation();
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirm(): void {
    this.modalRef?.hide();
    this.route.navigate([`/eventos/lista`])
  }

  public cssValidator(campoForm: FormControl): any {
    return { 'is-invalid': campoForm.errors && campoForm.touched }
  }

  public salvarEvento(): void {
    if (this.form.valid) {

      let service = {} as Observable<Evento>;

      this.evento = (this.estadoSalvarAtualizar == 'post')
        ? { ...this.form.value }
        : { id: this.evento.id, ...this.form.value }

      this.eventoService[this.estadoSalvarAtualizar](this.evento).subscribe(
        // next;
        // error;
        // complete;
        () => { console.log('Evento salvo.') },
        (error: any) => {
          console.error(error);
        },
        () => { }
      );
    }
  }
}
