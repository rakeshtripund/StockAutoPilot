import { Component } from '@angular/core';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  providers: [MessageService]
})
export class TransactionComponent {
  todaysTransactionList: any;
  todaysList: any;
  filter: any;
  allTransactionList: any;
  orderstatus: any
  fromDate: any
  scriptsList: any;
  toDate: any
  todaysProfit: any
  scriptName: any
  messageService: any;
  constructor(private http: HttpClient, private router: Router, messageService: MessageService) { }
  ngOnInit(): void {
    this.todaysList = {}
    this.fromDate = ""
    this.toDate = ""
    this.filter = []
    this.clearFilter();
    // this.trans_filter();
    this.getAllTransactions();
    this.orderstatus = ['Buy', 'Sell'];
  }
  getAllTransactions() {
    this.getData("http://127.0.0.1:5123/GetTransactionForCurrentDate").subscribe(data => {
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
  onFilter(num: number) {
    if (this.filter.scriptName === '') {
      this.todaysTransactionList = this.todaysTransactionList;
    } else {
      this.todaysTransactionList = this.todaysTransactionList;
      if (num === 1) {
        const scriptName = this.filter.scriptName;
        this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => e.scriptName.toString().includes(scriptName));
      }
    }
  }



  filterDate() {
    this.todaysProfit = 0
    console.log("from Date", this.fromDate)
    console.log("to Date", this.toDate)
    this.todaysTransactionList = this.allTransactionList
    if (this.fromDate == "" && this.toDate == "") {
      let d = new Date(new Date().setHours(0, 0, 0, 0))
      this.todaysTransactionList = this.allTransactionList
    }
    else if (this.fromDate !== "" && this.toDate == "") {
      let d = new Date(new Date(this.fromDate).setHours(0, 0, 0, 0))
      // this.getProfitByDateRange(d, "")
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) >= d)
      for (let i of this.todaysTransactionList) {
        this.todaysProfit += Number(i.profit)
      }
    }
    else if (this.toDate !== "" && this.fromDate == "") {
      let d = new Date(new Date(this.toDate).setHours(0, 0, 0, 0))
      // this.getProfitByDateRange("", d)
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) <= d)
      for (let i of this.todaysTransactionList) {
        this.todaysProfit += Number(i.profit)
      }
    }
    else if (this.fromDate != "" && this.toDate != "") {
      let d1 = new Date(new Date(this.fromDate).setHours(0, 0, 0, 0))
      let d2 = new Date(new Date(this.toDate).setHours(0, 0, 0, 0))
      // this.getProfitByDateRange(d1, d2);
      this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) >= d1 && new Date(new Date(e.orderDate).setHours(0, 0, 0, 0)) <= d2)
      for (let i of this.todaysTransactionList) {
        this.todaysProfit += Number(i.profit)
      }
    }
  }
  filterTodaysDate() {
    let d = new Date(new Date(Date.now()))
    this.todaysTransactionList = this.todaysTransactionList.filter((e: any) => e.orderDate.toDateString() === d.toDateString())
  }

  clearFilter() {
    this.filter = {
      scriptName: '',
      fromDate: '',
      toDate: '',
    };
    this.toDate = ""
    this.fromDate = ""
    this.todaysTransactionList = this.allTransactionList

  }
  getTodaysProfit() {
    this.getData("http://127.0.0.1:5123/getTodaysProfit").subscribe(data => {
      console.log(data)
      this.todaysProfit = data
      console.log()
    }, error => {
      if (error.status == 500) {
        console.log(error.error.message)

      }
    })
  }

  getProfitByDateRange(fromDate: any, toDate: any) {
    const params = new HttpParams().set("fromDate", fromDate).set("toDate", toDate)
    this.getDataWithParams("http://127.0.0.1:5123/GetProfitByDateRange", params).subscribe(data => {
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


