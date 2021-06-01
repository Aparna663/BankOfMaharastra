// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  APP_PARENT_BASE_URL:  'https://10.81.234.11:3000/',
  APRTAADMIN_PARENT_BASE_URL:'https://10.0.0.181:9398/rtaadmin/',
  //APP_RTA_DL: 'https://otsiqa.epragathi.org:9393/',
  APP_RTA_DL: 'http://localhost:8443/',
  // APP_RTA_REG: 'https://10.0.0.181:8083/',
  APP_RTA_REG: 'http://localhost:8988/',
  production: false
};

