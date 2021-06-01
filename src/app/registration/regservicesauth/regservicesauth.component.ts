import { Component, HostListener, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AppConstants } from '../../app.constants';
import { NotificationService } from '../../notifications/notification.service';

import * as JsEncryptModule from 'jsencrypt';
import { RegaadharauthService } from '../regaadharseedauth/regaadharauth.service';


@Component({
  selector: 'app-regservicesauth',
  templateUrl: './regservicesauth.component.html',
  styleUrls: ['./regservicesauth.component.css']
})
export class RegservicesauthComponent implements OnInit {


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
  aadharNumber: string;
  aadharNum: any;
  captcha: any;
  capchaEncodedImg: any;
  captchaValue: any;
  finalAadharReqBody: {};
  thumbScanned: boolean;
  captchaErrorMsg: string;
  input: any;
  timer: number;
  interval: any;
  timerText: string;
  authResult: any;
  da: { serviceIds: number[]; };
  authEnable: boolean;
  authTypeEnable : boolean;
  consent : any;
  permitsBtnEnable: boolean;
  variationOfPermitBtnEnable: boolean;
  loadingicon : boolean;
  aadharEncrypt: string |boolean;
  
  constructor(
    private authenticationService: RegaadharauthService,
    private datePipe: DatePipe,
    private constants: AppConstants,
    private notifications: NotificationService
  ) {

  }



  ngOnInit() {
    this.authType = "THUMB";
    this.otpRequested = false;
    this.thumbScanned = false;
    this.captchaErrorMsg = "";

  }

  @HostListener('window:message', ['$event'])
  onPostMessage(event) {
    if (event.data) {
      this.input = event.data;
     // console.log(this.input.serviceIds)
       this.getAuthTypes();
       if(this.input.isPermits && this.input.serviceIds[0] != 69){
         this.permitsBtnEnable = true;
         this.variationOfPermitBtnEnable = false;
       }
       if(this.input.isPermits && this.input.serviceIds.includes(69)){
        this.variationOfPermitBtnEnable = true;
        this.permitsBtnEnable = false;
       }
    }
  }
  getAuthTypes() {
    this.da = { "serviceIds": this.input.serviceIds }
    this.authenticationService.getDropdownAuth(this.da).subscribe((res : any) => {
      console.log(res);
      if (res.result) {
        this.authResult = res.result;
        this.authTypeEnable = true;
        this.authType = "THUMB";
      }
    })
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
   // otpReqBody[''] = this.input;
    this.aadhaarNo = this.encryptData(JSON.stringify(aadharNum))
    this.authenticationService.getSecurityKey(this.aadhaarNo).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getOtpByAdhar(otpReqBody, esVal, aadharNum).subscribe((result: any) => {
        if (result.result) {
          const response = result.result;
          this.otpSentData.oldTid = response.tid;
          this.otpSentData.txn = response.txn;
          this.otpRequested = true;
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
      clearInterval(this.interval);
    }, 60000);
  }

  //Authneticate user based on OTP details
  getAuthenticationByOTP() {
    this.otpSentData.vercode = this.otp;//otp received by user
    this.otpSentData.requestType = 'EKYC';
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

        this.finalAadharReqBody = {
          plainDataEncrypted: this.encryptData(JSON.stringify(deviceCaptureDtls)),
          encHmac: aadhaarResult.encHmac,
          encSessionKey: aadhaarResult.encSessionKey,
          encryptedPid: aadhaarResult.encryptedPid,
          mc: aadhaarResult.mc,
          pidData: aadhaarResult.pidData
        }
        this.getCaptcha();
        this.thumbScanned = true;
      } else {
        // this.aadharNumberValidated = true;
        // alert(this.error);
      }
    }, function (errResponse) {
      //this.aadharNumberValidated = true;
      alert(errResponse);
    });
  }



  encryptData(data) {
    let publicKey = this.constants.getRegPublicKey();
    var RSAEncrypt = new JsEncryptModule.JSEncrypt();
    RSAEncrypt.setPublicKey(publicKey);
    let encryptedPass = RSAEncrypt.encrypt(data);
    return encryptedPass;
  }
   decrypt(data) {
        let privatekey = this.constants.DecryptDlPrivateKey();
        var  RSADecrypt = new JsEncryptModule.JSEncrypt();
         RSADecrypt.setPrivateKey(privatekey);
        let encryptedPass = RSADecrypt.decrypt(data);
        //console.log(encryptedPass);
        return encryptedPass;
      } 

  getCaptcha() {
    this.authenticationService.getRegCaptcha().subscribe((res) => {
      this.captcha = res.result;
      this.capchaEncodedImg = this.captcha.capchaEncodedImg;
      this.captchaErrorMsg = "";
    },
      (error) => {
        console.log(error);
      })
  }
  agree() {
    
  }
  getAadharDetails() {
    this.captchaErrorMsg = "";
    if (this.authType === 'OTP') {
      this.otpSentData.vercode = this.otp;//otp received by user
      this.otpSentData.requestType = 'EKYC';
      this.finalAadharReqBody = {
        plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData)),
      }
    }

    this.finalAadharReqBody['captch'] = {
      capchaId: this.captcha.capchaId,
      capchaValue: this.captchaValue
    }
    this.input['aeo'] = this.finalAadharReqBody;
  
    this.aadharEncrypt = this.encryptData(JSON.stringify(this.aadharNum));
    this.input['aadharNo'] = this.aadharEncrypt;
    this.authenticationService.getRegSecurityKey(this.aadharEncrypt).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getRegServicesDetails(this.input, esVal).subscribe((res) => {
        if (res.result) {
          res.result.registrationDetails.applicantDetails.aadharNo = this.decrypt(JSON.stringify(res.result.registrationDetails.applicantDetails.aadharNo)); 
          console.log(this.constants.getParentUrl())
          window.parent.postMessage(res.result, this.constants.getParentUrl());
        } else {
          this.notifications.notify(res.message);
          this.getCaptcha();
        }
      }, (error) => {
        this.notifications.notify(error);
        this.getCaptcha();
      })
    }, (error: any) => {
      this.notifications.notify(error);
      this.getCaptcha();
    });
  }

  getPermitsAadharDetails(){
    this.captchaErrorMsg = "";
    if (this.authType === 'OTP') {
      this.otpSentData.vercode = this.otp;//otp received by user
      this.otpSentData.requestType = 'EKYC';
      this.finalAadharReqBody = {
        plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData)),
      }
    }

    this.finalAadharReqBody['captch'] = {
      capchaId: this.captcha.capchaId,
      capchaValue: this.captchaValue
    }

    // finalObject['aadharNo'] = this.aadharNum;
    this.aadharEncrypt=this.encryptData(JSON.stringify(this.aadharNum));
    var finalObject = {
      aadharNo : this.aadharEncrypt,
      PrNo : this.input.PrNo,
      serviceIds : this.input.serviceIds,
      module : 'Permits',
    // permitClassVO: this.input.permitClassVO
      }
      
    finalObject['aeo'] = this.finalAadharReqBody;
    this.authenticationService.getRegSecurityKey(this.aadharEncrypt).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getRegServicesDetails(finalObject, esVal).subscribe((res) => {
        if (res.result) {
          res.result.registrationDetails.applicantDetails.aadharNo = this.decrypt(JSON.stringify(res.result.registrationDetails.applicantDetails.aadharNo)); 
          console.log(this.constants.getParentUrl())
          window.parent.postMessage(res.result, this.constants.getParentUrl());
        } else {
          this.notifications.notify(res.message);
          this.getCaptcha();
        }
      }, (error) => {
        this.notifications.notify(error);
        this.getCaptcha();
      })
    }, (error: any) => {
      this.notifications.notify(error);
      this.getCaptcha();
    });
  }


  getVariationOfPermitsAadharDetails(){
    this.captchaErrorMsg = "";
    if (this.authType === 'OTP') {
      this.otpSentData.vercode = this.otp;//otp received by user
      this.otpSentData.requestType = 'EKYC';
      this.finalAadharReqBody = {
        plainDataEncrypted: this.encryptData(JSON.stringify(this.otpSentData)),
      }
    }

    this.finalAadharReqBody['captch'] = {
      capchaId: this.captcha.capchaId,
      capchaValue: this.captchaValue
    }
  
    this.aadharEncrypt=this.encryptData(JSON.stringify(this.aadharNum));
    var finalObject = {
      aadharNo :  this.aadharEncrypt,
      PrNo : this.input.PrNo,
      serviceIds : this.input.serviceIds,
      permitNo: this.input.permitNo,
      module : 'Permits'
      }
      finalObject['aeo'] = this.finalAadharReqBody;
    this.authenticationService.getRegSecurityKey(this.aadharEncrypt).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getRegServicesDetails(finalObject, esVal).subscribe((res) => {
        if (res.result) {
          res.result.registrationDetails.applicantDetails.aadharNo = this.decrypt(JSON.stringify(res.result.registrationDetails.applicantDetails.aadharNo)); 
          console.log(this.constants.getParentUrl())
          window.parent.postMessage(res.result, this.constants.getParentUrl());
        } else {
          this.notifications.notify(res.message);
          this.getCaptcha();
        }
      }, (error) => {
        this.notifications.notify(error);
        this.getCaptcha();
      })
    }, (error: any) => {
      this.notifications.notify(error);
      this.getCaptcha();
    });
  }
}
