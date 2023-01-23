import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Router } from '@angular/router';

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
  fromDate: any
  toDate: any
  todaysProfit: any

  constructor(private http: HttpClient, private router: Router) { }
  ngOnInit(): void {
    this.todaysList = {}
    this.fromDate = ""
    this.toDate = ""
    this.getAllTransactions();
    this.orderstatus = ['Buy', 'Sell'];
  }
  getAllTransactions() {
    this.getData("http://127.0.0.1:5000/GetTransactionForCurrentDate").subscribe(data => {
      console.log(data)
      this.getTodaysProfit();
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
      this.filterTodaysDate();
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }


  filterDate() {
    console.log("from Date", this.fromDate)
    console.log("to Date", this.toDate)
    this.todaysTransactionList = this.allTransactionList
    if (this.fromDate == "" && this.toDate == "") {
      let d = new Date(new Date().setHours(0, 0, 0, 0))
      this.todaysTransactionList = this.allTransactionList
    }
    else if (this.fromDate !== "" && this.toDate == "") {
      let d = new Date(new Date(this.fromDate).setHours(0, 0, 0, 0))
      this.getProfitByDateRange(d, "")
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) >= d)
    }
    else if (this.toDate !== "" && this.fromDate == "") {
      let d = new Date(new Date(this.toDate).setHours(0, 0, 0, 0))
      this.getProfitByDateRange("", d)
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) <= d)
    }
    else if (this.fromDate != "" && this.toDate != "") {
      let d1 = new Date(new Date(this.fromDate).setHours(0, 0, 0, 0))
      let d2 = new Date(new Date(this.toDate).setHours(0, 0, 0, 0))
      this.getProfitByDateRange(d1, d2);
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) >= d1 && new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) <= d2)
    }
  }
  filterTodaysDate() {
    let d = new Date(new Date(Date.now()))
    this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => e.orderDate.toDateString() === d.toDateString())
  }

  getTodaysProfit() {
    this.getData("http://127.0.0.1:5000/getTodaysProfit").subscribe(data => {
      console.log(data)
      this.todaysProfit = data
    })
  }

  getProfitByDateRange(fromDate: any, toDate: any) {
    const params = new HttpParams().set("fromDate", fromDate).set("toDate", toDate)
    this.getDataWithParams("http://127.0.0.1:5000/GetProfitByDateRange", params).subscribe(data => {
      console.log(data)
      this.todaysProfit = data
    })

  }
  getData(url: string,) {
    return this.http.get(url);
  }

  getDataWithParams(url: string, parameters: HttpParams) {
    return this.http.get(url, { params: parameters });
  }

}


