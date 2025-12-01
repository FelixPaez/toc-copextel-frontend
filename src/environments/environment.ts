// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // API Gateway URL - Cambiar según el entorno
  // API_URL_GATEWAY: 'http://192.168.11.44:9080/api', // Desarrollo local
  API_URL_GATEWAY: 'https://toc-services.copextel.com.cu/api', // Producción
  API_KEY: 'athfr4n1an48el24nd1el3l474ro4ath',
  AES_KEY: 'LXe8MwuIN1zxt3FPWTZFlAa16EHdPAdN918Z9RQWinf=',
  AES_IV: 'LKxnTRlsAyO7kCfWuyrnN9==',
  
  // Modo Mock - Cambiar a true para usar datos mock en lugar de la API
  useMocks: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
