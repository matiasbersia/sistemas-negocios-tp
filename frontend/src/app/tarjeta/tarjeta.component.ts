import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta.component.html',
  styleUrl: './tarjeta.component.css'
})
export class TarjetaComponent {

  @Input() modo: string = 'normal';

  @Input() eventosBuscados: any[] | null = null;

  @Output() Dato = new EventEmitter();
  @Output() modificar = new EventEmitter();
  @Output() borrar = new EventEmitter();

  eventos: any[] = [];

  ngOnInit() {
    fetch('https://sistemas-negocios-tp-zexg.vercel.app/eventos')
      .then(respuesta => respuesta.json())
      .then(datos => {
        console.log('Eventos recibidos:', datos);
        this.eventos = datos;
      })
      .catch(error => {
        console.error('Error al obtener los eventos:', error);
      });
  }

  get listaEventos() {
    /*
     * SI HAY UNA BÚSQUEDA
     * Se muestran los resultados filtrando también las fechas pasadas.
     */
    if (this.eventosBuscados !== null) {
      const ahora = new Date().getTime();
      return this.eventosBuscados.filter(evento => this.crearFecha(evento).getTime() >= ahora);
    }

    /*
     * INICIO
     * Se eliminan las tarjetas pasadas y se ordenan las futuras
     * de la más cercana a la más lejana.
     */
    if (this.modo === 'inicio') {
      const ahora = new Date().getTime();

      return this.eventos
        .filter(evento => {
          const fechaEvento = this.crearFecha(evento);
          return fechaEvento.getTime() >= ahora; // Borra / oculta si ya pasó
        })
        .sort((a, b) => {
          const fechaA = this.crearFecha(a);
          const fechaB = this.crearFecha(b);
          return fechaA.getTime() - fechaB.getTime();
        });
    }

    /*
     * MODIFICAR / ELIMINAR / NORMAL
     * Se mantiene el listado completo para la gestión del administrador.
     */
    return this.eventos;
  }

  crearFecha(evento: any): Date {
    const [año, mes, dia] = evento.fecha.split('-').map(Number);
    let hora = 0;
    let minutos = 0;

    if (evento.horario) {
      const partesHora = evento.horario.split(':');
      hora = Number(partesHora[0]);
      minutos = Number(partesHora[1]);
    }

    return new Date(
      año,
      mes - 1,
      dia,
      hora,
      minutos
    );
  }

  menu_m_i(evento: any) {
    this.Dato.emit(evento);
  }

  modificarEvento(evento: any) {
    this.modificar.emit(evento);
  }

  borrarEvento(evento: any) {
    this.borrar.emit(evento);
  }

}