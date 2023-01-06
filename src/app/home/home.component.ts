import { Component } from '@angular/core';
import { Script } from './Models/script.model';
import { ConfirmationService } from 'primeng/api';
import { timer } from 'rxjs';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public panelWidth: any;
  filter: any;
  scripts: any;
  title: any;
  title_form: any;

  edit_form_title: any;
  scriptsList: any;
  list_stock_details: any = [];
  flag: boolean = false
  isOnView: boolean = false;
  switchButton: boolean = false;
  isOnEdit: boolean = false;
  scriptData: any
  obsTimer: Observable<number> = timer(1000, 300 * 1000);
  currTime: number = 0;
  statuses: any = [];
  orderstatus: any = [];
  scriptCodes: any
  statusCodes: any
  selectedScript: any
  symbolName: string = ""
  symbol: string = ""
  scriptName: any
  transactionData: any
  CurrentPriceData: any
  transactiondetails: any;
  filterValue = '';
  allScriptsList: any = []


  constructor(private http: HttpClient, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.obsTimer.subscribe(() => {
      this.getData("http://127.0.0.1:5000/updateScriptsCurrentPrice").subscribe(data => {
        setTimeout(() => {
          this.getAllScripts();
        }, 500)
      })

    });
    this.title = 'Add Script'
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
    setTimeout(() => {
      this.filterByStatus("1")
    }, 500)
    this.statuses = ['Paused', 'Saved', 'Deleted', 'Live'];
    this.orderstatus = ['Buy', 'Sell'];

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
    this.postData("http://127.0.0.1:8001/InsertScript", formdata).subscribe(data => {

      console.log(data);
    });
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }


  // get all script details
  getAllScripts() {
    this.getData("http://127.0.0.1:8001/GetAllScripts").subscribe(data => {
      this.scriptsList = data
      this.allScriptsList = data
      console.log(this.scriptsList)
      this.scriptName = this.scriptsList[0].scriptName
      for (let script of this.scriptsList) {
        script.startDate = new Date(script.startDate);
        if (script.activeFlag == 1) {
          script.activeFlag = 'Live'
        }
        else if (script.activeFlag == 0) {
          script.activeFlag = 'Paused'
        }
        else if (script.activeFlag == -1) {
          script.activeFlag = 'Saved'
        }

      }
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

    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: () => {
        this.getData(`http://127.0.0.1:8001/StartProgram/${id}`).subscribe(data => {
        })
        this.updateScriptStatus(id, 1)
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
        let d = new Date(new Date(this.filter.startDate))
        this.scriptsList = this.scriptsList.filter((e: any) => e.startDate.toDateString() === d.toDateString());
      }

    }
  }

  filterByStatus(num: any) {
    this.scriptsList = this.allScriptsList
    if (num == "1") {
      console.log("1")
      console.log(this.scriptsList)
      this.scriptsList = this.scriptsList.filter((e: any) => e.isdeleted == 0);
      console.log(this.scriptsList)
    }
    else if (num == "2") {
      console.log("2")
      this.scriptsList = this.scriptsList.filter((e: any) => e.isdeleted == 1);
      console.log(this.scriptsList)
    }
  }

  filterDateInViewForm() {

  }

  updateScript(scriptForm: any) {

    scriptForm.id = this.scriptData.id
    scriptForm.scriptName = this.scriptData.scriptName
    console.log(scriptForm)
    this.putData("http://127.0.0.1:8001/UpdateScriptById", scriptForm).subscribe(data => {
      this.getAllScripts();
      this.closeNav();
    })
  }


  updateStatus(id: any, status: any) {
    let data = { scriptId: id, activeStatus: status }
    this.postData("http://127.0.0.1:8001/UpdateActiveStatus", data).subscribe(response => {
      console.log(response)
    })
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }


  getScriptById(id: any, mode: any) {

    this.getData(`http://127.0.0.1:8001/GetScriptById/${id}`).subscribe(data => {
      this.scriptData = data
      this.getTransactionById(id)
      this.getProfitByScriptById(id)
    })

    if (mode == 1) {
      this.isOnView = true
    }
    else if (mode == 2) {
      this.isOnEdit = true
      this.openNav();
    }

  }

  getAlllScriptCodes() {
    this.getData("http://127.0.0.1:8001/GetAllScriptCode").subscribe(data => {
      this.scriptCodes = data
    })
  }

  getAllStatusCodes() {
    this.getData("http://127.0.0.1:8001/GetAllScriptCode").subscribe(data => {
      this.statusCodes = data
    })
  }
  //gettransactionsdetailsbyid
  getTransactionById(id: any) {

    this.getData(`http://127.0.0.1:8001/getTransactionById/${id}`).subscribe(data => {
      this.transactionData = data
      for (let transaction of this.transactionData) {
        if (transaction.orderType == 1) {
          transaction.orderType = "Buy"
        }
        else if (transaction.orderType == -1) {
          transaction.orderType = "Sell"
        }
      }
      console.log(this.transactionData)
    })

  }

  //get current price by script id
  getCurrentPriceByScriptId(id: any) {
    this.getData(`http://127.0.0.1:8001/getCurrentpriceByscriptId/${id}`).subscribe(data => {
      this.CurrentPriceData = data
      console.log(data);
    })

  }

  // delete script by id
  delete(id: any) {
    this.getData(`http://127.0.0.1:8001/GetScriptById/${id}`).subscribe(data => {
      this.scriptData = data
      this.confirmationService.confirm({

        message: `Are you sure that you want to delete this script?${this.scriptData.scriptName} which was average bought at ${this.scriptData.avgPrice} at ${this.scriptData.currentprice} `,
        accept: () => {
          const params = new HttpParams().set("id", id)
            .set("qty", this.scriptData.quantityBalance)
            .set("scriptName", this.scriptData.scriptName)
          this.deleteData("http://127.0.0.1:8001/DeleteScriptById", params).subscribe(data => {
            setTimeout(() => {
              this.getAllScripts();
            }, 500);
            console.log(data)
          })
        }
      })
    })
  }

  updateScriptStatus(id: any, status: any) {
    const params = new HttpParams().set("id", id)
      .set("status", status)
    this.getDataWithParams("http://127.0.0.1:8001/UpdateScriptStatusById", params).subscribe(data => {
      setTimeout(() => {
        this.getAllScripts();
      }, 500);
    })
  }

  // CODE FOR  GET PROFIT BY SCRIPT ID

  getProfitByScriptById(id: any) {
    this.getData(`http://127.0.0.1:8001/getProfitByScriptId/${id}`).subscribe(data => {
      console.log(data);
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