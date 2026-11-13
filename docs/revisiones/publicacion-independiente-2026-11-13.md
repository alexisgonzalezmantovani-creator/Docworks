# Publicaciones de DocWorks y landing

La app DocWorks se publica desde `main` mediante su proyecto de Vercel habitual.

La landing es estable y se publica **solo a pedido**. El archivo `landing/vercel.json` desactiva los despliegues automáticos originados por Git para el proyecto cuya raíz sea `landing/`. Al actualizar solamente la aplicación no hace falta volver a publicar la web comercial.

Para publicar cambios en la landing, crear un despliegue de producción **manual** en el proyecto `docworks-landing` desde el commit de `main` mediante Vercel, verificar `READY` y revisar las páginas públicas. No cambiar las ramas ni sobrescribir la configuración de la app.

Los archivos `landing/captcha.js` y `landing/captcha-config.js` se pueden regenerar desde el código de la aplicación por el prebuild; ante cambios de CAPTCHA revisar si la landing también debe actualizarse.

Verificar en el historial de Vercel que solo se generó un despliegue de `docworks` con el commit que introduce este ajuste. Si `docworks-landing` sigue publicándose automáticamente, inspeccionar el Root Directory real de Vercel antes de cambiar más configuraciones.
