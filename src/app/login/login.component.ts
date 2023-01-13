import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginform: any = {}
  token: any

  constructor(private http: HttpClient) { }

  getLoginFormData(formdata: any) {
    console.log(formdata)
    this.postData("http://127.0.0.1:5000/authenticate", formdata).subscribe(response => {
      this.token = response
      localStorage.setItem("token", this.token.token)
    })
  }


  postData(url: string, body: any) {
    return this.http.post(url, body);
  }
}
