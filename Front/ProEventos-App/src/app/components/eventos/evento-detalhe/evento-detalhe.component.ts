import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '@app/services/evento.service';
import { Evento } from '@app/models/Evento';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DateTimeFormatPipe } from '@app/helpers/DateTimeFormat.pipe';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss']
})
export class EventoDetalheComponent implements OnInit {

  modalRef?: BsModalRef;
  evento = {} as Evento;
  form!: FormGroup;
  estadoSalvarAtualizar = 'post';

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
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public resetForm(): void {
    this.form.reset();
  }

  openModal(event: any, template: TemplateRef<any>) {
    event.stopPropagation();
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
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

      if (this.estadoSalvarAtualizar == 'post') {

        this.evento = {...this.form.value}

        this.eventoService.postEvento(this.evento).subscribe(
          // next;
          // error;
          // complete;
          () => { console.log('Evento salvo.') },
          (error: any) => {
            console.error(error);
          },
          () => {}
        );

      } else {

        this.evento = {id: this.evento.id, ...this.form.value}

        this.eventoService.putEvento(this.evento.id, this.evento).subscribe(
          // next;
          // error;
          // complete;
          () => { console.log('Evento salvo.') },
          (error: any) => {
            console.error(error);
          },
          () => {}
        );
      }
    }
  }
}
