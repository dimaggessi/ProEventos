import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-titulo',
  templateUrl: './titulo.component.html',
  styleUrls: ['./titulo.component.scss']
})
export class TituloComponent implements OnInit {
  @Input() titulo: string = '';
  @Input() iconClass?: string;
  @Input() subtitulo?: string;
  @Input() botaoListar: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
