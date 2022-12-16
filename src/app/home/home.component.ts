import { Component } from '@angular/core';
import { Script } from './Models/script.model';
import { HttpClient, HttpParams, } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public panelWidth: any;
  filter: any;
  scripts: any;
  title_form: any;
  scriptsList: any;
  list_stock_details: any = [];
  flag: boolean = false
  isOnView: boolean = false;
  switchButton: boolean = false;
  isOnEdit: boolean = false;
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.title_form = 'Script Name';
    this.isOnView = false
    this.isOnEdit = false
    this.switchButton = false
    this.scripts = {}
    this.filter = []
    this.getAllScripts();
    this.list_stock_details = [
      {
        start_date: '03/12/2022',
        start_time: 10.00,
        bought_for: 2,
        market_rate: 2.20,
        buy_target: 19.21,
        sell_target: 4,
        quantity_balance: 5,
        script_fund_balance: 45,
        profit_loss: 45,

      },
      {
        start_date: '03/12/2022',
        start_time: 8.00,
        bought_for: 2,
        market_rate: 4.20,
        buy_target: 45.21,
        sell_target: 4,
        quantity_balance: 5,
        script_fund_balance: 45,
        profit_loss: 45,

      },
      {
        start_date: '1/12/2022',
        start_time: 1.00,
        bought_for: 2,
        market_rate: 2.20,
        buy_target: 32.21,
        sell_target: 4,
        quantity_balance: 5,
        script_fund_balance: 45,
        profit_loss: 45,

      },
    ]
  }

  openNav() {
    this.panelWidth = '50%';
  }

  closeNav() {
    this.panelWidth = '0%';
  }
  getFormData(formdata: any) {
    console.log(formdata)
    this.postData("http://127.0.0.1:5000/StartProgram", formdata).subscribe(data => {
      console.log(data);
    });

  }

  getAllScripts() {
    this.getData("http://127.0.0.1:5000/GetAllScripts").subscribe(data => {
      console.log(data)
      this.scriptsList = data
    })

  }


  addScript(script: Script) {
    this.scriptsList.push(script)
    this.scripts = []
    this.flag = true
  }

  viewScriptById(id: number) {
    this.isOnView = true
  }
  editScriptById(id: number) {
    this.isOnEdit = true
  }
  viewMasterPage() {
    this.isOnEdit = false
    this.isOnView = false
  }

  onFilter(num: number) {
    if (this.filter.scriptName === '' && this.filter.trade_created_start_date === '' && this.filter.buyMargin === '' && this.filter.resetCriteria === '') {
      this.scriptsList = this.scriptsList;
    } else {
      this.scriptsList = this.scriptsList;
      if (num === 1) {
        const scriptName = this.filter.scriptName;
        this.scriptsList = this.scriptsList.filter((e: any) => e.scriptName.toString().includes(scriptName));
      }
      else if (num === 2) {
        const trade_created_start_date = this.filter.trade_created_start_date;
        this.scriptsList = this.scriptsList.filter((e: any) => e.trade_created_start_date.toString().includes(trade_created_start_date));
      }

    }
  }
  switchPlayPause() {
    this.switchButton = !this.switchButton
  }
  getData(url: string,) {
    return this.http.get(url);
  }

  getDataWithParams(url: string, parameters: HttpParams) {
    return this.http.get(url, { params: parameters });
  }
  // code to post data
  postData(url: string, body: any) {
    return this.http.post(url, body);
  }

}