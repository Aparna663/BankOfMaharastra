import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { AppConstants } from '../../app.constants';
import * as JsEncryptModule from 'jsencrypt';
import { NotificationService } from '../../notifications/notification.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-aadharseedauth',
  templateUrl: './aadharseedauth.component.html',
  styleUrls: ['./aadharseedauth.component.css']
})
export class AadharseedauthComponent implements OnInit {

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
  otpSentData:any= { };
  disableResend: boolean;
  showResend: boolean;
  aadharNumber:string;
  aadharNum:any;
  captcha: any;
  capchaEncodedImg: any;
  captchaValue: any;
  finalAadharReqBody: {};
  thumbScanned: boolean;
  input: any;
  EncAppNum : any;
  timer: number;
  interval: any;
  timerText: string;
  consent: any;
  scannedfinger: boolean;
  otpflag: boolean;
  scannedflag: boolean;
  loadingicon: boolean;
  encryptaadharNumber: string | boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private datePipe : DatePipe,
    private constants : AppConstants,
    private notifications : NotificationService
  ) { }

  

  ngOnInit() {
    this.authType = "THUMB";
    this.otpRequested = false;
    this.thumbScanned = false;
    // window.parent.onmessage = function(e){
    //   console.log(e.data);
    // }
  }

  @HostListener('window:message', ['$event']) 
  onPostMessage(event) {
    if(event.data){
      this.input = event.data;
      console.log(this.input);
      
    }
  }
  // @HostListener
  // window.addEventListener('message', function(e) {
  //   var origin = e.originalEvent.origin || e.origin;
    
  //   console.log('received message:  ' + e.data, e);
  // }, false);
  // window.addEventListener('message', (event) => {
  //   console.log(`Received message: ${event.data}`);
  // });

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
      plainDataEncrypted : this.encryptData(JSON.stringify(this.otpSentData)),
    }
    this.encryptaadharNumber = this.encryptData(JSON.stringify(aadharNum))
    this.authenticationService.getSecurityKey(this.encryptaadharNumber).subscribe((result: any) => {
      let esVal = btoa(result.result);
      this.authenticationService.getOtpByAdhar(otpReqBody,esVal).subscribe((result: any) => {
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
      // if (this.stopResend === true) {
      //   //this.resendOtp();
      // }
      clearInterval(this.interval);
    }, 60000);
  }

  //Authneticate user based on OTP details
  getAuthenticationByOTP() {
    this.otpSentData.vercode = this.otp;//otp received by user
    this.otpSentData.requestType = 'EKYC';
    this.finalAadharReqBody = {
      plainDataEncrypted : this.encryptData(JSON.stringify(this.otpSentData))
    }
  }

  thumbScan(aadharNum) {
    //this.userDetails.isAadhaarValidated = true;
    var uid_num  = aadharNum;
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
        aadhaarResult.pidData=this.authenticationService.pidRequest.response;
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
          plainDataEncrypted : this.encryptData(JSON.stringify(deviceCaptureDtls)),
          encHmac : aadhaarResult.encHmac,
          encSessionKey : aadhaarResult.encSessionKey,
          encryptedPid : aadhaarResult.encryptedPid,
          mc : aadhaarResult.mc,
          pidData : aadhaarResult.pidData
        }
        this.getCaptcha();
        this.thumbScanned = true;
        this.scannedfinger = true;
        this.scannedflag =true;
      } else {
        // this.aadharNumberValidated = true;
        // alert(this.error);
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
    return encryptedPass;
  }

  getCaptcha() {
    this.authenticationService.getCaptcha().subscribe((res)=>{
      if(res.result){
        this.captcha = res.result;
        this.capchaEncodedImg = this.captcha.capchaEncodedImg;
      }else{
        this.notifications.notify(res.message);
      }
    },
    (error)=>{
      this.notifications.notify(error);
    })
  }

  getAadharDetails() {
      if(this.authType === 'OTP'){
        this.otpSentData.vercode = this.otp;//otp received by user
        this.otpSentData.requestType = 'EKYC';
        this.finalAadharReqBody = {
          plainDataEncrypted : this.encryptData(JSON.stringify(this.otpSentData))
        }
      }
      this.finalAadharReqBody['captch'] = {
        capchaID : this.captcha.capchaID,
        capchaValue : this.captchaValue
      }
      this.input['aeo'] = this.finalAadharReqBody;
      this.loadingicon = true;
      this.encryptaadharNumber = this.encryptData(JSON.stringify(this.aadharNum))
    this.authenticationService.getSecurityKey(this.encryptaadharNumber).subscribe((result: any) => {
      let esVal = btoa(result.result);
      if(typeof this.input.isSeedCL === "boolean"){
        this.authenticationService.getDlAadharSeedDetails(this.input, esVal).subscribe((res) => {
          if (res.result) {
            window.parent.postMessage(res.result, this.constants.getParentUrl());
            this.loadingicon = false;
          } else {
            this.notifications.notify(res.message);
            this.getCaptcha();
            this.captchaValue='';
            this.scannedfinger = false;
            this.scannedflag =false;
            this.consent = false;
            this.loadingicon = false;
          }
        }, error => {
          this.notifications.notify(error);
          this.getCaptcha();
          this.captchaValue='';
          this.scannedfinger = false;
          this.scannedflag =false;
          this.consent = false;
          this.loadingicon = false;
        })
      }else{
        this.EncAppNum = this.input.applicationFormNo;
        this.input.applicationFormNo = this.EncAppNum;
        this.input.aadharNo=this.encryptaadharNumber; //Application Num is Encoded as SAME SERVICE is Using in DL in STATUS
        this.authenticationService.getLlrCancellationDetails(this.input, esVal).subscribe((res) => {
          if (res.result) {
            window.parent.postMessage(res.result, this.constants.getParentUrl());
            this.loadingicon = false;
          } else {
            this.notifications.notify(res.message);
            this.getCaptcha();
            this.captchaValue='';
            this.scannedfinger = false;
            this.scannedflag =false;
            this.consent = false;
            this.loadingicon = false;
          }
        }, error => {
          this.notifications.notify(error);
          this.getCaptcha();
          this.captchaValue='';
          this.scannedfinger = false;
          this.scannedflag =false;
          this.consent = false;
          this.loadingicon = false;
        })
      }
      
    }, error => {
      this.notifications.notify(error);
      this.getCaptcha();
      this.captchaValue='';
      this.scannedfinger = false;
      this.scannedflag =false;
      this.consent = false;
      this.loadingicon = false;
    })
      //window.parent.postMessage(this.finalAadharReqBody,this.constants.getParentUrl());
  }
  

}
