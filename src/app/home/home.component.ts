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
  scriptData: any
  scriptCodes: any
  selectedScript: any
  symbolName: string = ""
  symbol: string = ""
  scriptName: any
  filterValue = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.title_form = 'Script Name';
    this.isOnView = false
    this.isOnEdit = false
    this.switchButton = false
    this.scripts = {}
    this.filter = []
    this.scriptData = {}
    this.getAllScripts();
    this.getAlllScriptCodes();
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
    formdata.scriptName = "NSE:TATASTEEL-EQ"
    console.log(formdata)
    this.postData("http://127.0.0.1:5000/InsertScript", formdata).subscribe(data => {
      console.log(data);
    });
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }

  getAllScripts() {
    this.getData("http://127.0.0.1:5000/GetAllScripts").subscribe(data => {
      this.scriptsList = data
      this.scriptName = this.scriptsList[0].scriptName
      console.log(this.scriptName)
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

  startProgram(id: any) {
    this.getData(`http://127.0.0.1:5000/StartProgram/${id}`).subscribe(data => {
      console.log(data)
    })
  }


  onFilter(num: number) {
    if (this.filter.scriptName === '' && this.filter.startDate === '' && this.filter.buyMargin === '' && this.filter.resetCriteria === '') {
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
  updateStatus(id: any, status: any) {
    let data = { scriptId: id, activeStatus: status }
    this.postData("http://127.0.0.1:5000/UpdateActiveStatus", data).subscribe(response => {
      console.log(response)
    })
    setTimeout(() => {
      this.getAllScripts(),
        500
    })
  }

  getScriptById(id: any) {

    this.getData(`http://127.0.0.1:5000/GetScriptById/${id}`).subscribe(data => {
      this.scriptData = data
    })
    this.isOnView = true
  }

  getAlllScriptCodes() {
    this.getData("http://127.0.0.1:5000/GetAllScriptCode").subscribe(data => {
      this.scriptCodes = data
    })
  }

  //   myResetFunction(options: DropdownFilterOptions) {
  //     options.reset();
  //     this.filterValue = '';

  // }

  // delete(id:any) {
  //   this.getData(`http://127.0.0.1:5000/GetScriptById/${id}`).subscribe(data => {
  //     this.scriptData = data
  // })
  //   this.ConfirmationService.confirm({
  //       message: 'Are you sure that you want to delete this Project Tracker ?',
  //       accept: () => {
  //           const params = new HttpParams().set('projectTrackerId', this.dataService.encryptUsingAES256(String(this.ProjectTrackerId)));
  //           this.dataService.deleteData(ApiURIs.DELETEPROJECTTRACKERBYID, params).subscribe(Response => {
  //               console.log(Response);
  //           });
  //           setTimeout(() => {
  //               this.getProjectTrackerList();
  //           }, 800);
  //       }
  //   });
  // }


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
  putData(url: string, body: any) {
    return this.http.put(url, body);
  }

}