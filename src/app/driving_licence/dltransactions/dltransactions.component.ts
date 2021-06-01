import { Component, HostListener, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import * as JsEncryptModule from 'jsencrypt';
import { AppConstants } from '../../app.constants';
import { NotificationService } from '../../notifications/notification.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-dltransactions',
  templateUrl: './dltransactions.component.html',
  styleUrls: ['./dltransactions.component.css']
})
export class DltransactionsComponent implements OnInit {

  otpRequested: boolean;
  conversionDecryptOutput: any;
  conversionEncryptOutput: any;
  authType: string;
  deviceType: string;
  aadharInfo: any;
  base64Img: any;
  date: any;
  otp: any;
  aadhaarNo: any;
  disableButt: boolean;
  otpShow: boolean;
  otpSentData: any = {};
  disableResend: boolean;
  showResend: boolean;
  receiverWindow: any;
  aadharNumber: string;
  aadharNum: any;
  captcha: any;
  capchaEncodedImg: any;
  captchaValue: any;
  finalAadharReqBody: {};
  thumbScanned: boolean;
  timer: number;
  interval: any;
  timerText: string;
  stopResend: boolean;
  consent: any;
  aadhaarErrMsg: string;
  aadharNumberValidated: boolean;
  citizenInput: any;
  scannedfinger: boolean;
  otpflag: boolean;
  scannedflag: boolean;
  loadingicon: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private datePipe: DatePipe,
    private constants: AppConstants,
    private notifications: NotificationService
  ) { }

  ngOnInit() {
    this.authType = "THUMB";
    var sourceLocation = "";
    this.otpRequested = false;
    this.thumbScanned = false;
    window.onload = function () {

    }
    window.onmessage = function (e) {
      if (e.data) {
        sourceLocation = e.data;
      }
    }
    this.receiverWindow = sourceLocation;
  }

  @HostListener('window:message', ['$event'])
  onPostMessage(event) {
    if (event.data) {


      this.citizenInput = event.data;
    }
  }

  // checking Aadhar number validation
  validateAadharNumber() {
    if (this.aadharNum && this.aadharNum.length === 12) {
      if (!this.authenticationService.validateVerhoeff(this.aadharNum)) {
        // this.applicantDetails.aadharNo.error('Aadhaar number is not valid.');
        this.aadhaarErrMsg = 'Aadhaar number is not valid.';
        this.aadharNumberValidated = false;
      } else {
        this.aadhaarErrMsg = '';
        this.aadharNumberValidated = true;
      }
    } else {
      this.aadhaarErrMsg = '';
      this.aadharNumberValidated = false;
    }
  }

  getOtp(aadharNum) {
    this.disableResend = true;
    let myDate = new Date();
    this.date = this.datePipe.transform(myDate, 'yyyy/MM/dd hh:mm:ss.sss');
    this.otpShow = true;
    this.disableButt = true;
    this.otpSentData = {
      authType: 'OTP',
      crt: this.date,
      idType: 'A',
      requestType: 'OTP',
      uid_num: aadharNum
    };

    //let encBody = this.encryptData(JSON.stringify(this.otpSentData));
    let otpReqBody = {
      plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData)),
    }
    this.aadhaarNo = this.encryptData(JSON.stringify(aadharNum))
    this.authenticationService.getSecurityKey(this.aadhaarNo).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getOtpByAdhar(otpReqBody, esVal).subscribe((result: any) => {
        if (result.result) {
          const response = result.result;
          this.otpSentData.oldTid = response.tid;
          this.otpSentData.txn = response.txn;
          this.otpRequested = true;
          this.otpflag = true;
          this.getCaptcha();
          this.otpTimer();
        } else {
          this.notifications.notify(result.message);
          this.disableButt = false;
          this.showResend = true;
        }
      });
    })

  }
  agree() {

  }
  otpTimer() {
    this.timer = 60;
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
        if (this.timer < 10) {
          this.timerText = '00:0' + this.timer;
        } else {
          this.timerText = '00:' + this.timer;
        }
      }
    }, 1000);
    setTimeout(() => {
      this.disableResend = false;
      if (this.stopResend === true) {
        //this.resendOtp();
      }
      clearInterval(this.interval);
    }, 60000);
  }
  //Authneticate user based on OTP details
  getAuthenticationByOTP() {
    this.otpSentData.vercode = this.otp;//otp received by user
    this.otpSentData.requestType = 'EKYC';

    var iframeData = {
      thumbData: {},
      aadharResult: {}
    }
    iframeData.thumbData = this.otpSentData;
    // let otpResultBody = {
    //   plainDataEncrypted : this.encryptData(JSON.stringify(this.otpSentData))
    // }
    this.finalAadharReqBody = {
      plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData))
    }

  }

  thumbScan(aadharNum) {
    //this.userDetails.isAadhaarValidated = true;
    var uid_num = aadharNum;
    const numbersCheck = /^[0-9]+$/;
    if (uid_num && !uid_num.match(numbersCheck)) {
      return false;
    }
    if (uid_num) {
      this.toThumbScan(uid_num);
    }
  }

  // ================================================
  // function getting Thumb Request and sending to Aadhar Service to Fetch Aadhar Details
  // ================================================
  toThumbScan(aadharnumber): any {
    //this.deviceType = "seg";
    //localStorage.setItem('deviceType', JSON.stringify(this.deviceType));

    const sportNumber = this.authenticationService.Info();
    //let secuGenPort = JSON.parse(localStorage.getItem('secuGenPort'));
    //this.dynamicPort = secuGenPort;

    const initValues = this.authenticationService.initfunc();
    const thumbResponse = this.authenticationService.GetUIDPID(initValues.timeStamp);
    thumbResponse.then((response: any) => {
      if (response.data && response.data.PidData && response.data.PidData.Resp.$.errInfo
        && response.data.PidData.Resp.$.errInfo === 'SUCCESS') {
        // this.scanData.fpImage="assets/images/finger-print.png"; // for dummy thumb

        const result = response.data.PidData;
        const aadhaarResult = <any>{};
        aadhaarResult.pidData = this.authenticationService.pidRequest.response;
        aadhaarResult.encryptedPid = result.Data._;
        aadhaarResult.encSessionKey = result.Skey._;
        aadhaarResult.encHmac = result.Hmac;
        // Gettiing serial number
        let serialNumber;
        // angular.forEach(result.DeviceInfo.$.additional_info.Param,function(value,_Index){
        for (const value of (result.DeviceInfo.additional_info.Param)) {
          if (value.$.name === 'srno') {
            serialNumber = value.$.value;
            // toDO need write break statement...
          }
        }
        aadhaarResult.ci = result.Skey.$.ci;
        aadhaarResult.udc = serialNumber;
        aadhaarResult.mi = result.DeviceInfo.$.mi;
        aadhaarResult.mc = result.DeviceInfo.$.mc;
        aadhaarResult.rdsId = result.DeviceInfo.$.rdsId;
        aadhaarResult.rdsVer = result.DeviceInfo.$.rdsVer;
        aadhaarResult.dc = result.DeviceInfo.$.dc;
        aadhaarResult.dpId = result.DeviceInfo.$.dpId;
        aadhaarResult.isAadhaarValid = true;

        // var js2xmlparser = require("js2xmlparser");
        // aadhaarResult.pidData = js2xmlparser.parse("PidData", result);

        if (initValues.tidtimestamp) {
          aadhaarResult.tid = 'UKC:' + initValues.tidtimestamp;
        } else {
          const servertimestamp = '1495026304';
          aadhaarResult.tid = 'UKC:' + servertimestamp;
        }
        aadhaarResult.uid_num = aadharnumber; // passing aadhaar number
        aadhaarResult.timeStamp = initValues.timeStamp;
        aadhaarResult.crt = initValues.crt;
        if (result.NFIQ) {
          aadhaarResult.attemptType = result.NFIQ + 'FA';
        } else {
          aadhaarResult.attemptType = '1FA';
        }

        // Calling AADHAAR SERVICE TO GET AADHAR DATA
        const currentTime = this.datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm:ss.SSS');
        aadhaarResult.idType = "A";
        aadhaarResult.uid_num = aadharnumber;
        aadhaarResult.aadhaarNo = aadharnumber;
        aadhaarResult.crt = currentTime;
        aadhaarResult.authType = "EKYC";
        let deviceCaptureDtls = JSON.parse(JSON.stringify(aadhaarResult));
        delete deviceCaptureDtls.encHmac;
        delete deviceCaptureDtls.encSessionKey;
        delete deviceCaptureDtls.encryptedPid;
        delete deviceCaptureDtls.mc;
        delete deviceCaptureDtls.pidData;
        //Call here for aadhar details...
        //let encBody = this.encryptData(JSON.stringify(deviceCaptureDtls));
        this.finalAadharReqBody = {
          plainDataEncrypted: this.encryptData(JSON.stringify(deviceCaptureDtls)),
          encHmac: aadhaarResult.encHmac,
          encSessionKey: aadhaarResult.encSessionKey,
          encryptedPid: aadhaarResult.encryptedPid,
          mc: aadhaarResult.mc,
          pidData: aadhaarResult.pidData
        }
        this.getCaptcha();
        this.scannedfinger = true;
        this.thumbScanned = true;
        this.scannedflag = true;

      } else {
        // this.aadharNumberValidated = true;
        this.notifications.notify("Some error occured during scan, Please try again.")
      }
    }, function (errResponse) {
      //this.aadharNumberValidated = true;
      this.notifications.notify(errResponse);
    });
  }



  encryptData(data) {
    let publicKey = this.constants.getDlPublicKey();
    var RSAEncrypt = new JsEncryptModule.JSEncrypt();
    RSAEncrypt.setPublicKey(publicKey);
    let encryptedPass = RSAEncrypt.encrypt(data);
    //console.log(encryptedPass);
    return encryptedPass;
  }

  decrypt(data) {
    let privatekey = this.constants.DecryptDlPrivateKey();
    var RSADecrypt = new JsEncryptModule.JSEncrypt();
    RSADecrypt.setPrivateKey(privatekey);
    let encryptedPass = RSADecrypt.decrypt(data);
    //console.log(encryptedPass);
    return encryptedPass;
  }

  getCaptcha() {
    this.authenticationService.getCaptcha().subscribe((res) => {
      if (res.result) {
        this.captcha = res.result;
        this.capchaEncodedImg = this.captcha.capchaEncodedImg;
      } else {
        this.notifications.notify(res.message);
      }
    },
      (error) => {
        this.notifications.notify(error);
      })
  }

  getAadharDetails() {
    if (this.authType === 'OTP') {
      this.otpSentData.vercode = this.otp;//otp received by user
      this.otpSentData.requestType = 'EKYC';
      this.finalAadharReqBody = {
        plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData))
      }
    }
    this.finalAadharReqBody['captch'] = {
      capchaID: this.captcha.capchaID,
      capchaValue: this.captchaValue
    }
    this.loadingicon = true;
    //console.log(this.finalAadharReqBody);
    this.aadhaarNo = this.encryptData(JSON.stringify(this.aadharNum))
    this.authenticationService.getSecurityKey(this.aadhaarNo).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getAadharDetails(this.finalAadharReqBody, esVal).subscribe((result: any) => {

        if (result.result) {
          this.loadingicon = false;
          this.aadharInfo = result.result;
          var imgPrfx = "data:image/jpg;base64,";
          this.base64Img = imgPrfx + result.result.base64file;
          var iframeData = {
            aadharResult: {}
          }
          iframeData.aadharResult = result.result;
          this.decrypt(JSON.stringify(this.citizenInput.aadharNo));
          if (this.citizenInput && this.citizenInput.aadharNo === this.aadharNum) {
            window.parent.postMessage(iframeData, this.constants.getParentUrl());
          } else if (this.citizenInput && this.citizenInput.otherState) {
            //for DL Other state
            iframeData['aadharRequest'] = this.finalAadharReqBody;
            window.parent.postMessage(iframeData, this.constants.getParentUrl());
          }
          else {
            this.notifications.notify("Aadhaar number mismatch")
          }
        } else {
          this.notifications.notify(result.message);
          this.getCaptcha();
          this.captchaValue = '';
          this.scannedfinger = false;
          this.scannedflag = false;
          this.consent = false;
          this.loadingicon = false;
        }
      },
        (err: any) => {
          this.notifications.notify(err);
          this.getCaptcha();
          this.captchaValue = '';
          this.scannedfinger = false;
          this.scannedflag = false;
          this.consent = false;
          this.loadingicon = false;
        });
    }, (err: any) => {
      this.notifications.notify(err);
      this.getCaptcha();
      this.captchaValue = '';
      this.scannedfinger = false;
      this.scannedflag = false;
      this.consent = false;
      this.loadingicon = false;
    });
  }

}
