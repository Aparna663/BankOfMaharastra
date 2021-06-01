import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { parseString } from 'xml2js';
import { AppConstants } from '../../app.constants';

@Injectable()
export class RegaadharauthService {

  aadhaarServiceparams: string;
  uri: string;
  results: string;
  deviceType: string;
  pidRequest: XMLHttpRequest;
  
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private constants: AppConstants,
  ) {
  }

  
  getOtpByAdhar(otpSentData, esVal,aadharNum):  Observable<any>  { 
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('uiToken', esVal);
   // headers = headers.append('aadhaarNo', aadharNum);
    return this.httpClient.post(this.constants.getDLUrl('AADHAR_RESULT'), otpSentData, { headers: headers });
  }

  getRegAadharSeedDetails(data,esVal): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('uiToken', esVal);
    return this.httpClient.post(this.constants.getREGUrl('GET_REG_AADHAR_SEED_DETAILS'), data, {headers: headers});
  }

  // getRegSecurityKey(aadharNum) : Observable<any> {
  //   let headers: HttpHeaders = new HttpHeaders();
  //   headers = headers.append('aadhaarNo', aadharNum);
  //   return this.httpClient.get(this.constants.getREGUrl('REG_SECURE_TOKEN'), { headers: headers });
  // }
  getRegSecurityKey(aadharNum) : Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
  //  headers = headers.append('aadhaarNo', aadharNum);
    return this.httpClient.post(this.constants.getREGUrl('REG_SECURE_TOKEN'),aadharNum);
  }


  getSecurityKey(aadharNum) : Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
   // headers = headers.append('aadhaarNo', aadharNum);
    
    return this.httpClient.post(this.constants.getDLUrl('SECURE_TOKEN'),aadharNum);
  }


  getRegCaptcha() : Observable<any> {
    return this.httpClient.get(this.constants.getREGUrl('GET_REG_CAPTCHA'));
  }

  getRegServicesDetails(data,esVal): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('uiToken', esVal);
    return this.httpClient.post(this.constants.getREGUrl('REG_SERVICES_AADHAR_DETAILS'), data, {headers: headers});
  }
  getDropdownAuth(ids){
    // const requestData = { 'serviceIds':ids };
    return this.httpClient.post(this.constants.getREGUrl('GET_DROPDOWN'), ids)
      .map((response: Response) => {
        // const result = response.json();
        return response;
      });
  }
  


  // for aadhar number check
  d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];


  // The permutation table
  p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];


  // The inverse table
  // var inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  validateVerhoeff(num) {
    let cc;
    let c = 0;
    const myArray = this.StringToReversedIntArray(num);
    for (let i = 0; i < myArray.length; i++) {
      c = this.d[c][this.p[(i % 8)][myArray[i]]];
    }

    cc = c;
    if (cc === 0) {
      return true;
    } else {
      return false;
    }
  }

  /*
  * Converts a string to a reversed integer array.
  */
  StringToReversedIntArray(num) {
    let myArray = [num.length];
    for (let i = 0; i < num.length; i++) {
      myArray[i] = (num.substring(i, i + 1));
    }
    myArray = this.Reverse(myArray);
    return myArray;
  }

  /*
  * Reverses an int array
  */
  Reverse(myArray) {
    const reversed = [myArray.length];
    for (let i = 0; i < myArray.length; i++) {
      reversed[i] = myArray[myArray.length - (i + 1)];
    }
    return reversed;
  }

  // for aadhar number check end
  //============================
  // get THumb DATA
  //============================
  GetUIDPID(curr_datetime) {
    let deviceType = "seg";
    let dynamicPort = 11100;
    if (deviceType === 'iris') {
      this.uri = 'https://localhost:' + dynamicPort + '/rd/capture';
      this.aadhaarServiceparams = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><PidOptions ver="1.0"><Opts fCount="" fType="" iCount="1" iType="0" pCount="0" pType="" format="0" pidVer="2.0" timeout="10000" wadh="8QSrHOmcQhlyjiSpIgCi7o2ugs78w+4jhckNk1jeIJg=" env="PP" /><CustOpts><Param name="ValidationKey" value=""/></CustOpts></PidOptions>';
    } else if (deviceType === 'seg') {
      this.uri = 'https://localhost:' + dynamicPort + '/rd/capture';
      this.aadhaarServiceparams = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" env="PP" otp="" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" posh="LEFT_THUMB"/><CustOpts><Param name="ValidationKey" value=""/></CustOpts></PidOptions>';
    } else {
      this.uri = 'https://localhost:' + dynamicPort + '/rd/capture';
      this.aadhaarServiceparams = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><PidOptions ver="1.0"><Opts fCount="1" fType="0" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" env="PP" otp="" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" posh="LEFT_THUMB"/><CustOpts><Param name="ValidationKey" value=""/></CustOpts></PidOptions>';
    }

    const u = this.uri;
    const params = this.aadhaarServiceparams;
    // var xmlhttp = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      this.pidRequest= new XMLHttpRequest();
     const xmlhttp=this.pidRequest;
      //const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          const fpobject: string = xmlhttp.responseText;
          const xml = fpobject;
          parseString(xml, { explicitArray: false }, (err, result) => {
            resolve({ data: result });
          });
          // resolve({ data: fpobjectJSON });
        } else if (xmlhttp.status === 404) {
          reject(xmlhttp);
        }
      };
      xmlhttp.onerror = function () {
        reject(xmlhttp);
      };
      xmlhttp.onabort = function () {
        /* //alert("Aborted"); */
      };
      xmlhttp.open('CAPTURE', u, true);
      xmlhttp.send(params);
    });

  }

  initfunc() {
    const currdate = new Date();

    const curr_datetime = currdate.getFullYear() + '-'
      + ((currdate.getMonth() >= 9) ?
        (currdate.getMonth() + 1) : ('0' + (currdate.getMonth() + 1))) + '-'
      + ((currdate.getDate() >= 10) ?
        (currdate.getDate()) : ('0' + (currdate.getDate()))) + 'T'
      + currdate.getHours() + ':'
      + currdate.getMinutes() + ':'
      + currdate.getSeconds();

    const client_request_time = currdate.getFullYear() + '/'
      + ((currdate.getMonth() >= 9) ?
        (currdate.getMonth() + 1) : ('0' + (currdate.getMonth() + 1))) + '/'
      + ((currdate.getDate() >= 10) ?
        (currdate.getDate()) : ('0' + (currdate.getDate()))) + ' '
      + currdate.getHours() + ':'
      + currdate.getMinutes() + ':'
      + currdate.getSeconds() + '.'
      + currdate.getMilliseconds();

    const tidtime = currdate.getFullYear() + ''
      + ((currdate.getMonth() >= 9) ?
        (currdate.getMonth() + 1) : ('0' + (currdate.getMonth() + 1))) + ''
      + ((currdate.getDate() >= 10) ?
        (currdate.getDate()) : ('0' + (currdate.getDate()))) + ''
      + currdate.getHours() + ''
      + currdate.getMinutes() + ''
      + currdate.getSeconds() + ''
      + currdate.getMilliseconds();

    return { timeStamp: curr_datetime, crt: client_request_time, tidtimestamp: tidtime };
  }
  // IRIS DEVICE PORT SCANNING START
  GetRDServiceExtInfo() {

    setTimeout(function () {

      try {
        for (let i = 11100; i <= 11110; i++) {
          try {
            this.irisurl = 'http://localhost:' + i + '/';
            // var xhr = getXMLHttpRequest('RDSERVICE', this.irisurl, false);
            // xhr.send();
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
              if (this.readyState === 4 && this.status === 200) {
                // i - 1;
                // var data = xhr.responseText
                // var oDOM = parseXml(data);
                // var info = oDOM.documentElement.getAttribute('info');
                // if (info != null && info.indexOf('IriShield-USB-MK2120UL') != -1 && info.indexOf('Registered Device Service Ext') != -1) {

               // localStorage.setItem('irisPort', JSON.stringify(i));
                return i;

                // }
              }
            };
            xhttp.open('RDSERVICE', this.irisurl, false);
            xhttp.send();

            const status = xhttp.status;

            if (status === 200) {

            }
          } catch (e) {
            console.log(e.message);
          }
        }
      } finally {
        // closeModal();
      }
    }, 0);
  }
  // IRIS DEVICE PORT SCANNING END
  // SecuGen DEVICE PORT SCANNING START
  Info() {
    var f = (function () {
      var xhr = [], i;
      for (i = 11100; i < 11110; i++) {
        //for loop
        (function (i) {
          //  alert(i);
          xhr[i] = new XMLHttpRequest();
          xhr[i].onreadystatechange = function () {
            if (xhr[i].readyState == 4 && xhr[i].status == 200) {
              //if (xhr[i].responseText == "<RDService status=\"READY\" info=\"SecuGen India Registered device Level 0\"> <Interface id=\"CAPTURE\" path=\"/rd/capture\" /><Interface id=\"DEVICEINFO\" path=\"/rd/info\" /></RDService>")
              if (xhr[i].responseText.includes("SecuGen") == true) {
                //alert('Your Port IS ' + i);
                // alert(xhr[i].responseText);
                this.secuGenPort = i;
                //localStorage.setItem('secuGenPort', JSON.stringify(this.secuGenPort));
                return i;

                //$scope.secuGenPort = $sessionStorage.$scope.Text1;

                //SucessInfo(xhr[i].responseText);
              }
            }
            else if (xhr[i].status == 404) {

            }
            else if (xhr[i].status == 503) {

            }
          }

          xhr[i].onerror = function () {

          }

          xhr[i].onabort = function () {
            alert("Aborted");
          }


          var uriData = "https://localhost:" + i + '/';
          xhr[i].open("RDSERVICE", uriData, true);

          xhr[i].send();

        })(i);
      }
    })();

    return f;

  }
//SecuGen End



}
