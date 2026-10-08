# Transferencia de datos mediante secuencia de QR

## Objetivo

Permitir que un usuario transfiera datos entre dos dispositivos utilizando únicamente la cámara y la pantalla de los dispositivos, mediante una secuencia de códigos QR que contienen directamente los datos de la transferencia.

La transferencia debe funcionar **offline**, sin requerir servidores, cuentas de usuario, Bluetooth, Wi-Fi Direct ni una conexión a Internet.

## Descripción funcional

La aplicación deberá permitir iniciar una transferencia en un dispositivo emisor y recibirla en un dispositivo receptor.

El emisor deberá:

1. Seleccionar los datos que desea transferir.
2. Preparar los datos para su transmisión.
3. Dividir los datos en fragmentos.
4. Generar una secuencia ordenada de códigos QR.
5. Mostrar los códigos QR de forma secuencial en pantalla.

El receptor deberá:

1. Iniciar el modo de recepción.
2. Utilizar la cámara para capturar los códigos QR mostrados por el emisor.
3. Identificar la transferencia a la que pertenece cada fragmento.
4. Validar cada fragmento recibido.
5. Detectar fragmentos duplicados, inválidos o faltantes.
6. Reconstruir los datos originales.
7. Validar la integridad de la transferencia.
8. Informar al usuario cuando la transferencia haya finalizado correctamente.

## Requisitos funcionales

### RF-01 — Crear transferencia

El usuario deberá poder iniciar una nueva transferencia seleccionando los datos que desea enviar.

### RF-02 — Fragmentación

La aplicación deberá dividir los datos en fragmentos adecuados para ser codificados dentro de códigos QR.

Cada fragmento deberá contener información suficiente para:

* Identificar la transferencia.
* Identificar la posición del fragmento.
* Conocer el número total de fragmentos.
* Validar la integridad del fragmento.
* Recuperar el contenido del fragmento.

### RF-03 — Secuencia de QR

El emisor deberá mostrar los fragmentos mediante una secuencia de códigos QR.

La aplicación deberá permitir configurar o determinar automáticamente la velocidad de cambio de los códigos QR para facilitar su captura por la cámara del receptor.

### RF-04 — Recepción

El receptor deberá escanear automáticamente la secuencia de QR sin requerir que el usuario tome una fotografía individual de cada código.

### RF-05 — Reordenamiento

Los fragmentos podrán ser recibidos fuera de orden y la aplicación deberá poder reordenarlos utilizando su información de secuencia.

### RF-06 — Detección de duplicados

La aplicación deberá ignorar fragmentos que ya hayan sido recibidos.

### RF-07 — Recuperación ante pérdida

La aplicación deberá detectar fragmentos faltantes y proporcionar un mecanismo para recuperarlos sin tener que reiniciar necesariamente toda la transferencia.

### RF-08 — Integridad

La aplicación deberá verificar que los datos reconstruidos sean idénticos a los datos originales mediante un mecanismo de integridad de la transferencia.

### RF-09 — Finalización

El receptor deberá informar claramente si:

* La transferencia terminó correctamente.
* La transferencia está incompleta.
* La transferencia contiene datos inválidos.
* La transferencia no pudo ser reconstruida.

### RF-10 — Cancelación

El usuario deberá poder cancelar una transferencia en cualquier momento.

### RF-11 — Privacidad

Los datos deberán transmitirse directamente dentro de los QR y no deberán enviarse a servidores externos.

### RF-12 — Transferencias grandes

La solución deberá permitir transferir cantidades de datos superiores a las que caben en un único QR, utilizando múltiples códigos QR.

## Flujo principal

```text
EMISOR                              RECEPTOR

Seleccionar datos
       │
       ▼
Preparar datos
       │
       ▼
Comprimir / procesar
       │
       ▼
Dividir en fragmentos
       │
       ▼
Generar QR
       │
       │       QR 1
       │ ───────────────────────► Escanear
       │       QR 2
       │ ───────────────────────► Escanear
       │       QR 3
       │ ───────────────────────► Escanear
       │       ...
       │       QR N
       │ ───────────────────────► Escanear
       │
       │                         Reordenar
       │                            │
       │                            ▼
       │                         Reconstruir
       │                            │
       │                            ▼
       │                       Validar integridad
       │                            │
       │                            ▼
       │                      Transferencia OK
```

## Restricciones

* La transferencia deberá funcionar sin conexión a Internet.
* No deberá requerirse un servidor intermediario.
* Los datos deberán estar contenidos directamente en los códigos QR.
* El receptor deberá poder procesar automáticamente una secuencia de códigos QR.
* La solución deberá tolerar lecturas duplicadas.
* La solución deberá detectar lecturas incorrectas o datos corruptos.

## Criterios de aceptación

### AC-01 — Transferencia básica

**Dado** un conjunto de datos válido
**Cuando** el usuario inicia una transferencia y el receptor escanea toda la secuencia
**Entonces** el receptor deberá reconstruir exactamente los datos originales.

### AC-02 — Transferencia offline

**Dado** que ambos dispositivos no tienen conexión a Internet
**Cuando** se realiza una transferencia
**Entonces** la transferencia deberá completarse correctamente.

### AC-03 — Fragmentos fuera de orden

**Dado** que los fragmentos son recibidos fuera de orden
**Cuando** se reciben todos los fragmentos
**Entonces** el receptor deberá reconstruir los datos correctamente.

### AC-04 — Fragmentos duplicados

**Dado** que un mismo QR es leído varias veces
**Cuando** el receptor procesa los códigos
**Entonces** los duplicados no deberán alterar el resultado de la transferencia.

### AC-05 — Fragmento faltante

**Dado** que uno o más fragmentos no fueron recibidos
**Cuando** termina la secuencia
**Entonces** la aplicación deberá detectar que la transferencia está incompleta.

### AC-06 — Integridad

**Dado** que todos los fragmentos fueron recibidos
**Cuando** se reconstruyen los datos
**Entonces** la aplicación deberá verificar su integridad antes de considerar completada la transferencia.

### AC-07 — Cancelación

**Dado** que existe una transferencia en progreso
**Cuando** cualquiera de los usuarios la cancela
**Entonces** la transferencia deberá detenerse y liberar los recursos asociados.

## Consideraciones para el diseño

La implementación deberá mantener separado el **protocolo de transferencia** de la interfaz de usuario y del mecanismo concreto utilizado para mostrar o capturar los QR.

El protocolo deberá permitir evolucionar posteriormente hacia mecanismos como:

* QR dinámicos.
* Corrección de errores.
* Compresión.
* Cifrado.
* Transferencia bidireccional de confirmaciones.
* Reintentos selectivos.
* Diferentes tamaños de fragmento.
* Diferentes velocidades de transmisión.

La decisión sobre el algoritmo de fragmentación, formato del payload, capacidad efectiva de cada QR, mecanismo de corrección de errores y estrategia de sincronización deberá resolverse mediante los correspondientes **spikes técnicos** antes de establecer la implementación definitiva.
