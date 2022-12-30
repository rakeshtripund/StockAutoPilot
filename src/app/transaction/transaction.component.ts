import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent {
  todaysTransactionList: any;
  todaysList: any;


  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.todaysList = {}
    this.getAllTransactions();



  }
  getAllTransactions() {
    this.getData("http://127.0.0.1:5000/GetTransactionForCurrentDate").subscribe(data => {
      this.todaysTransactionList = data

    })

  }
  getData(url: string,) {
    return this.http.get(url);
  }

  getDataWithParams(url: string, parameters: HttpParams) {
    return this.http.get(url, { params: parameters });
  }

}


