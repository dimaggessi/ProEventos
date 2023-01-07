import { Component, OnInit } from '@angular/core';
import { Evento } from '../models/Evento';
import { EventoService } from '../services/evento.service';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  // providers: [EventoService]
})

export class EventosComponent {

  public eventos: Evento[] = [];
  public eventosFiltrados: Evento[] = [];
  public widthImg: number = 150;
  public marginImg: number = 2;

  public isCollapsed: boolean = false;
  private _filtroLista: string = "";

  constructor(private eventoService: EventoService) { }

  public ngOnInit() : void {
    this.getEventos();
  }

  public getEventos(): void {
    this.eventoService.getEventos().subscribe(
      (_eventos : Evento[]) => {
        this.eventos = _eventos,
        this.eventosFiltrados = this.eventos;
      },
      error => console.log(error)
    );
  }

  public get filtroLista() : string {
    return this._filtroLista;
  }

  public set filtroLista(value : string) {
    this._filtroLista = value;
    this.eventosFiltrados = this.filtroLista ? this.filtrarEventos(this.filtroLista) : this.eventos;
  }

  public filtrarEventos(filtrarPor : string) : Evento[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      (evento: { tema : string; local: string; }) => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1 ||
      evento.local.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    )
  }

  public change() : void {
    this.isCollapsed = !this.isCollapsed;
  }
}

