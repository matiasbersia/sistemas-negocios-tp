
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TarjetaComponent } from './tarjeta/tarjeta.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TarjetaComponent,
    MenuComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  contador = 0;
  i = 0;
  eventoSeleccionado: any = null;
  usuario = '';
  contrasena = '';
  admin = false;

  // BUSCAR
  busqueda = '';
  eventosBuscados: any[] | null = null;

  // LISTA GENERAL DE EVENTOS
  listaEventos: any[] = [];

  ngOnInit() {
    this.cargarEventos();
  }

  // Carga los eventos generales al iniciar la app
  cargarEventos() {
    fetch('https://sistemas-negocios-tp-zexg.vercel.app/eventos')
      .then(respuesta => respuesta.json())
      .then(datos => {
        this.listaEventos = datos;
      })
      .catch(error => {
        console.error('Error al cargar los eventos:', error);
      });
  }

  recibirDato(evento: any) {
    this.eventoSeleccionado = evento;
    this.i = 1;
  }

  cerrar() {
    this.i = 0;
    this.eventoSeleccionado = null;
  }

  cerrar_menu() {
    this.contador = 0;
  }

  abrir_menu() {
    if (this.contador == 1) {
      this.contador = 0;
    } else {
      this.contador = 1;
    }
  }

  abrirBuscar() {
    this.busqueda = '';
    this.eventosBuscados = null;
    this.i = 2;
  }

  buscarEvento() {
    
    console.log('Texto buscado:', this.busqueda);

    if (this.busqueda.trim() === '') {
      this.eventosBuscados = null;
      return;
    }

    const url =
      `https://sistemas-negocios-tp-zexg.vercel.app/eventos/buscar/${encodeURIComponent(this.busqueda.trim())}`;

    fetch(url)
      .then(respuesta => respuesta.json())
      .then(datos => {
        console.log('Resultados recibidos:', datos);
        this.eventosBuscados = datos.filter(
          (evento: any) => this.eventoVigente(evento.fecha)
        );
      })
      .catch(error => {
        console.error('Error en la búsqueda:', error);
        this.eventosBuscados = [];
      });
  }


iniciarSesion() {
  const usuarioIngresado = this.usuario.trim().toLowerCase();
const contrasenaIngresada = this.contrasena.trim();

  if (
    (usuarioIngresado === 'admin' && contrasenaIngresada === '12345') ||
    (usuarioIngresado === 'valentina' && contrasenaIngresada === '12345')
  ) {
    console.log('Inicio de sesión correcto');
    this.admin = true;
    this.contador = 0;
  } else {
    alert('Cuenta incorrecta. Verifique el usuario y la contraseña.');
  }
}


  cerrarAdmin() {
    this.admin = false;
  }

  abrirInicio() {
    this.i = 0;
    this.busqueda = '';
    this.eventosBuscados = null;
  }

  // FUNCIÓN PARA VALIDAR SI LA FECHA ESTÁ VIGENTE
  eventoVigente(fechaEvento: string): boolean {
    if (!fechaEvento) return true;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Acepta fechas en formato DD/MM/YYYY o YYYY-MM-DD
    const partes = fechaEvento.split('/');

    let fechaParsed: Date;

    if (partes.length === 3) {
      const dia = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const anio = Number(partes[2]);
      fechaParsed = new Date(anio, mes, dia);
    } else {
      fechaParsed = new Date(fechaEvento + 'T00:00:00');
    }

    if (isNaN(fechaParsed.getTime())) return true;

    fechaParsed.setHours(0, 0, 0, 0);
    return fechaParsed >= hoy;
  }

  // Getter para obtener solo los eventos que no han expirado
  get eventosVigentes() {
    return this.listaEventos.filter(
      evento => this.eventoVigente(evento.fecha)
    );
  }
}
