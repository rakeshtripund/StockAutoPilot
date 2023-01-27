import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: any = {}
  token: any
  errorMessage: any

  constructor(private http: HttpClient, private router: Router) { }
  ngOnInit(): void {
    this.loginForm = {}
    this.errorMessage = ""
  }

  getLoginFormData(formdata: any) {
    console.log(formdata)
    this.postData("http://127.0.0.1:8001/authenticate", formdata).subscribe(response => {
      this.token = response
      localStorage.setItem("token", this.token.token)
      this.router.navigate(["/StockAutoPilot"])
    }, error => {
      if (error.status == 404) {
        console.log(error.error.message)
        this.errorMessage = error.error.message
      }
    })
  }


  postData(url: string, body: any) {
    return this.http.post(url, body);
  }
}
