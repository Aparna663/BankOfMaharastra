import {Component,OnInit} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AppConstants } from '../app.constants';
@Component({
	selector: 'app-next',
	templateUrl: './next.component.html',
	styleUrls: ['./next.component.css']
})
export class NextComponent implements OnInit {
	constructor(private constants: AppConstants) {}
	ngOnInit() {
		window.onmessage = function(e) {
			if (e.data&&e.data.toString()&&e.data.includes("dataObj")) {
				let deviceCaptureDtls = JSON.parse(e.data.toString());
				var stringData = JSON.stringify(deviceCaptureDtls.dataObj);
				const key = CryptoJS.enc.Utf8.parse('7061737323313233');
				const iv = key;
				if (stringData) {
					const encrypted = CryptoJS.AES.encrypt(stringData, key, {
						keySize: 16,
						iv: iv,
						mode: CryptoJS.mode.ECB,
						padding: CryptoJS.pad.Pkcs7
					});
					var msgObj = {
						"eventName": e.data && deviceCaptureDtls.eventObject && deviceCaptureDtls.eventObject.eventName,
						"encodeObj": encrypted.toString()
					}
					window.parent.postMessage(msgObj,deviceCaptureDtls.returnPage);

				}
			}
		}
	}

	  decrypt(data){
	    const key = CryptoJS.enc.Utf8.parse('7061737323313233');
	    const iv = CryptoJS.enc.Utf8.parse('7061737323313233');
	    const decyrpt = CryptoJS.AES.decrypt(data,key,{
	      keySize: 16,
	      iv: iv,
	      mode: CryptoJS.mode.ECB,
	      padding: CryptoJS.pad.Pkcs7
	    })
	var decrypt=decyrpt.toString(CryptoJS.enc.Utf8);
	    }
}