import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent {
  private key = CryptoJS.enc.Utf8.parse('MAKV2SPBNI992121');
  private iv = CryptoJS.enc.Utf8.parse('MAKV2SPBNI992121');
  loginForm: any = {}
  token: any
  errorMessage: any
  messageService: any;

  constructor(private http: HttpClient, private router: Router, messageService: MessageService) { }
  ngOnInit(): void {
    this.loginForm = {}
    this.errorMessage = ""
  }

  encryptUsingAES256(encryptString: any) {
    const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify(encryptString)), this.key, {
      keySize: 128 / 8,
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
  }


  getLoginFormData(formdata: any) {
    // console.log(formdata)
    formdata.password = this.encryptUsingAES256(formdata.password)
    console.log(formdata)
    this.postData(environment.baseUrl + "authenticate", formdata).subscribe(response => {
      this.token = response
      localStorage.setItem("token", this.token.token)
      this.router.navigate(["/StockAutoPilot"])
    }, error => {
      if (error.status == 404) {
        console.log(error.error.message)
        this.errorMessage = error.error.message
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }


  postData(url: string, body: any) {
    return this.http.post(url, body);
  }
}
