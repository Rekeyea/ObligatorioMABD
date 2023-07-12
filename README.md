# Obligatorio Modelos Avanzados de Base de Datos

## Módulo de Mensajería

- Correr el comando ```npm i```
- Correr el comando ```npm start```
- Ir a la url ```/channel/:channel_id/user/:user_id```
  - Cambiando el channel_id y el user_id se podrán ver y enviar los distintos mensajes en los diferentes canales disponibles
 
El código que obtiene e inserta en Cassandra se encuentra en el archivo ```index.js```.
- Para obtener los mensajes se usa la consulta en la linea 33
- Para insertar los mensajes se usa el statement en la linea 41
