
import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { TarjetaComponent } from '../tarjeta/tarjeta.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    TarjetaComponent,
    FormsModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  @Output() volver = new EventEmitter();

  pagina = 'inicio';

  i = 0;

  eventoSeleccionado: any = null;

  eventoModificar: any = null;

  busqueda = '';

  eventosBuscados: any[] | null = null;

  nuevoEvento = {
    nombre: '',
    fecha: '',
    horario: '',
    responsable: '',
    lugar: '',
    descripcion: ''
  };


  volverPagina() {
    this.volver.emit(0);
  }


  abrirInicio() {
    this.pagina = 'inicio';
    this.i = 0;
    this.eventoSeleccionado = null;
    this.eventoModificar = null;
    this.busqueda = '';
    this.eventosBuscados = null;
  }


  abrirCrear() {
    this.pagina = 'crear';
    this.i = 0;
    this.eventoSeleccionado = null;
    this.eventoModificar = null;
    this.busqueda = '';
    this.eventosBuscados = null;
  }


  abrirModificar() {
    this.pagina = 'modificar';
    this.i = 0;
    this.eventoSeleccionado = null;
    this.eventoModificar = null;
    this.busqueda = '';
    this.eventosBuscados = null;
  }


  abrirEliminar() {
    this.pagina = 'eliminar';
    this.i = 0;
    this.eventoSeleccionado = null;
    this.eventoModificar = null;
    this.busqueda = '';
    this.eventosBuscados = null;
  }


  recibirDato(dato: any) {
    this.eventoSeleccionado = dato;
    this.i = 1;
  }


  cerrar() {
    this.i = 0;
    this.eventoSeleccionado = null;
  }


  crearEvento() {
    fetch('https://sistemas-negocios-tp-zexg.vercel.app/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.nuevoEvento)
    })
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al crear el evento');
      }
      return respuesta.json();
    })
    .then(datos => {
      console.log('Evento creado:', datos);
      alert('Evento creado correctamente');

      this.nuevoEvento = {
        nombre: '',
        fecha: '',
        horario: '',
        responsable: '',
        lugar: '',
        descripcion: ''
      };
    })
    .catch(error => {
      console.error('Error al crear el evento:', error);
      alert('Error al crear el evento');
    });
  }


  buscarEvento() {
    console.log('BOTON DE BUSQUEDA PRESIONADO');
    console.log('Texto buscado:', this.busqueda);

    if (this.busqueda.trim() === '') {
      console.log('La búsqueda está vacía');
      this.eventosBuscados = null;
      return;
    }

    const url =
      `https://sistemas-negocios-tp-zexg.vercel.app/eventos/buscar/${encodeURIComponent(this.busqueda.trim())}`;

    console.log('URL que se está consultando:', url);

    fetch(url)
      .then(respuesta => {
        console.log('Respuesta del servidor:', respuesta);

        if (!respuesta.ok) {
          throw new Error('Error al buscar los eventos');
        }

        return respuesta.json();
      })
      .then(datos => {
        console.log('Resultados recibidos:', datos);

        const ahora = new Date().getTime();
        this.eventosBuscados = datos.filter((evento: any) => this.crearFecha(evento).getTime() >= ahora);
      })
      .catch(error => {
        console.error('ERROR EN LA BUSQUEDA:', error);
        this.eventosBuscados = [];
      });
  }


  modificarEvento(evento: any) {
    this.eventoModificar = { ...evento };
  }


  cancelarModificacion() {
    this.eventoModificar = null;
  }


  guardarModificacion() {
    if (!this.eventoModificar) {
      return;
    }

    fetch(
      `https://sistemas-negocios-tp-zexg.vercel.app/eventos/${this.eventoModificar.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.eventoModificar)
      }
    )
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al modificar el evento');
      }
      return respuesta.json();
    })
    .then(datos => {
      console.log('Evento modificado:', datos);
      alert('Evento modificado correctamente');

      this.eventoModificar = null;

      if (this.busqueda.trim() !== '') {
        this.buscarEvento();
      } else {
        this.eventosBuscados = null;
      }
    })
    .catch(error => {
      console.error('Error al modificar el evento:', error);
      alert('Error al modificar el evento');
    });
  }


  borrarEvento(evento: any) {
    console.log('Borrar evento:', evento);

    fetch(`https://sistemas-negocios-tp-zexg.vercel.app/eventos/${evento.id}`, {
      method: 'DELETE'
    })
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al eliminar el evento');
      }
      return respuesta.json();
    })
    .then(datos => {
      console.log('Evento eliminado:', datos);
      alert('Evento eliminado correctamente');

      if (this.busqueda.trim() !== '') {
        return fetch(
          `https://sistemas-negocios-tp-zexg.vercel.app/eventos/buscar/${encodeURIComponent(this.busqueda.trim())}`
        );
      }

      return fetch('https://sistemas-negocios-tp-zexg.vercel.app/eventos');
    })
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Error al actualizar la lista');
      }
      return respuesta.json();
    })
    .then(datos => {
      console.log('Lista actualizada:', datos);

      const ahora = new Date().getTime();
      this.eventosBuscados = datos.filter((evento: any) => this.crearFecha(evento).getTime() >= ahora);
    })
    .catch(error => {
      console.error('Error al eliminar el evento:', error);
      alert('Error al eliminar el evento');
    });
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

}
