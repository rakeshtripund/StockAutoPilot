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
  filter: any = [];
  allTransactionList: any;
  orderstatus: any

  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.todaysList = {}
    this.getAllTransactions();
    this.orderstatus = ['Buy', 'Sell'];

  }
  getAllTransactions() {
    this.getData("http://127.0.0.1:5000/GetTransactionForCurrentDate").subscribe(data => {
      this.todaysTransactionList = data
      this.allTransactionList = data
      for (let transaction of this.todaysTransactionList) {
        transaction.orderDate = new Date(transaction.orderDate)
        if (transaction.orderType == 1) {
          transaction.orderType = "Buy"
        }
        else if (transaction.orderType == -1) {
          transaction.orderType = "Sell"
        }
      }
    })

  }

  filterDate() {
    let d = new Date()
    console.log(d.toDateString())
    this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => e.orderDate.toDateString() === d.toDateString())
  }
  getData(url: string,) {
    return this.http.get(url);
  }

  getDataWithParams(url: string, parameters: HttpParams) {
    return this.http.get(url, { params: parameters });
  }

}


