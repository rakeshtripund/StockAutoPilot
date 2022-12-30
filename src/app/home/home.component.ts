import { Component } from '@angular/core';
import { Script } from './Models/script.model';
import { ConfirmationService } from 'primeng/api';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';

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
  statusCodes: any
  transactionData: any
  CurrentPriceData: any
  transactiondetails: any;
  filterValue = '';


  constructor(private http: HttpClient, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.title_form = 'Script Name';
    this.isOnView = false
    this.isOnEdit = false
    this.switchButton = false
    this.scripts = {}
    this.filter = []
    this.scriptData = {}
    this.transactionData = {}
    this.CurrentPriceData = {}
    this.transactiondetails = {}
    this.getAllScripts();
    this.getAlllScriptCodes();
    this.getAllStatusCodes();
  }


  openNav() {
    this.panelWidth = '50%';
  }

  closeNav() {
    this.panelWidth = '0%';
  }

  //post script data
  getFormData(formdata: any) {
    console.log(formdata)
    this.postData("http://127.0.0.1:5000/InsertScript", formdata).subscribe(data => {

      console.log(data);
    });
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }


  // get all script details
  getAllScripts() {
    this.getData("http://127.0.0.1:5000/GetAllScripts").subscribe(data => {
      this.scriptsList = data
      this.scriptName = this.scriptsList[0].scriptName
      console.log(this.scriptName)
    })
  }

  getAllScriptsWithCurrentPrice() {
    return this.http.get("http://127.0.0.1:5000/GetAllScripts")
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

    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      accept: () => {
        this.getData(`http://127.0.0.1:5000/StartProgram/${id}`).subscribe(data => {
          console.log(data)
        })
      }

    });


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
      this.getTransactionById(id)
    })

    this.isOnView = true
  }

  getAlllScriptCodes() {
    this.getData("http://127.0.0.1:5000/GetAllScriptCode").subscribe(data => {
      this.scriptCodes = data
    })
  }

  getAllStatusCodes() {
    this.getData("http://127.0.0.1:5000/GetAllScriptCode").subscribe(data => {
      this.statusCodes = data
    })
  }
  //gettransactionsdetailsbyid
  getTransactionById(id: any) {

    this.getData(`http://127.0.0.1:5000/getTransactionById/${id}`).subscribe(data => {
      this.transactionData = data
      console.log(data);
    })

  }

  //get current price by script id
  getCurrentPriceByScriptId(id: any) {
    this.getData(`http://127.0.0.1:5000/getCurrentpriceByscriptId/${id}`).subscribe(data => {
      this.CurrentPriceData = data
      console.log(data);
    })

  }

  // delete script by id
  delete(id: any) {
    this.getData(`http://127.0.0.1:5000/GetScriptById/${id}`).subscribe(data => {
      this.scriptData = data
      this.confirmationService.confirm({

        message: `Are you sure that you want to delete this script?${this.scriptData.scriptName} which was average bought at ${this.scriptData.avgPrice} at `,
        accept: () => {
          const params = new HttpParams().set("id", id)
          this.deleteData("http://127.0.0.1:5000/DeleteScriptById", params).subscribe(data => {
            setTimeout(() => {
              this.getAllScripts();
            }, 500);
            console.log(data)
          })
        }
      })
    })
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
  putData(url: string, body: any) {
    return this.http.put(url, body);
  }

  deleteData(url: string, parameters: HttpParams) {
    return this.http.delete(url, { params: parameters });
  }

}