import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResult, Pagination } from '@app/models/Pagination';
import { Palestrante } from '@app/models/Palestrante';
import { PalestranteService } from '@app/services/palestrante.service';
import { environment } from '@environments/environment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-palestrante-lista',
  templateUrl: './palestrante-lista.component.html',
  styleUrls: ['./palestrante-lista.component.scss']
})

export class PalestranteListaComponent implements OnInit {

  public palestrantes: Palestrante[] = [];
  public eventoId = 0;
  public pagination = {} as Pagination;

  constructor(private palestranteService: PalestranteService,
              private modalService: BsModalService,
              private router: Router) { }

  public ngOnInit(): void {
    this.pagination = { currentPage: 1, itemsPerPage: 3, totalItems: 1 } as Pagination;
    this.getSpeakers();
  }

  termoBuscaChanged: Subject<string> = new Subject<string>();

  public speakersFilter(evt: any): void {
    if (this.termoBuscaChanged.observers.length == 0) {

      this.termoBuscaChanged.pipe(debounceTime(500)).subscribe(
        filtrarPor => {
          this.palestranteService.getPalestrantes(
          this.pagination.currentPage,
          this.pagination.itemsPerPage,
          filtrarPor
          ).subscribe(
            (paginatedResult : PaginatedResult<Palestrante[]>) => {
              this.palestrantes = paginatedResult.result;
              this.pagination = paginatedResult.pagination;
            },
            error => console.log(error)
          );
        }
      )
    }
    this.termoBuscaChanged.next(evt.value);
  }

  public getImageURL(imageName: string): string {
    if (imageName)
      return environment.apiURL + `resources/perfil/${imageName}`;
    else
      return './assets/img/perfil.png';
  }

  public getSpeakers(): void {

    this.palestranteService
    .getPalestrantes(this.pagination.currentPage,
                       this.pagination.itemsPerPage)
    .subscribe(
      (paginatedResult : PaginatedResult<Palestrante[]>) => {
      this.palestrantes = paginatedResult.result;
      this.pagination = paginatedResult.pagination;
      },
      error => console.log(error)
    );
  }
}
