import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { environment } from '@environments/environment';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-lista.component.html',
  styleUrls: ['./evento-lista.component.scss']
})
export class EventoListaComponent implements OnInit {

  modalRef?: BsModalRef;
  public eventos: Evento[] = [];
  public eventoId: number = 0;
  public pagination = {} as Pagination;

  termoBuscaChanged: Subject<string> = new Subject<string>();

  public widthImg: number = 150;
  public marginImg: number = 2;

  public isCollapsed: boolean = false;

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private router: Router
    ) { }

  public ngOnInit() : void {
    this.pagination = { currentPage: 1, itemsPerPage: 3, totalItems: 1 } as Pagination;
    this.getEventos();
  }

  public getEventos(): void {
    this.eventoService.getEventos(this.pagination.currentPage,
                                  this.pagination.itemsPerPage).subscribe(
      (paginatedResult : PaginatedResult<Evento[]>) => {
        this.eventos = paginatedResult.result;
        this.pagination = paginatedResult.pagination;
      },
      error => console.log(error)
    );
  }

  public filtrarEventos(evt: any): void {
    if (this.termoBuscaChanged.observers.length == 0) {

      this.termoBuscaChanged.pipe(debounceTime(500)).subscribe(
        filtrarPor => {
          this.eventoService.getEventos(
          this.pagination.currentPage,
          this.pagination.itemsPerPage,
          filtrarPor
          ).subscribe(
            (paginatedResult : PaginatedResult<Evento[]>) => {
              this.eventos = paginatedResult.result;
              this.pagination = paginatedResult.pagination;
            },
            error => console.log(error)
          );
        }
      )
    }
    this.termoBuscaChanged.next(evt.value);
  }

  public change() : void {
    this.isCollapsed = !this.isCollapsed;
  }

  public mostraImagem(imagemURL: string): string {
    return (imagemURL !== '')
    ? `${environment.apiURL}resources/images/${imagemURL}`
    : 'assets/semImg.jpg';
  }

  openModal(event: any, template: TemplateRef<any>, eventoId: number) {
    event.stopPropagation();
    this.eventoId = eventoId;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  public pageChanged(event): void {
    this.pagination.currentPage = event.page;
    this.getEventos();
  }

  confirm(): void {
    this.modalRef?.hide();
    this.eventoService.delete(this.eventoId).subscribe(
      (result: string) => {
        this.getEventos();
      }, //next
      (error: any) => {
        console.error(error);
      }, //error
      () => {}  //complete
    );
  }

  decline(): void {
    this.modalRef?.hide();
  }

  detalheEvento(id: number): void {
    this.router.navigate([`eventos/detalhe/${id}`]);
  }
}
