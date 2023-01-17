import { Component } from '@angular/core';
import { Script } from './Models/script.model';
import { ConfirmationService } from 'primeng/api';
import { timer } from 'rxjs';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

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
  selectedScriptCP: any


  constructor(private http: HttpClient, private confirmationService: ConfirmationService, public router: Router) { }

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

  //open add script function
  openNav() {
    this.panelWidth = '50%';
  }
  //close add script function 
  closeNav() {
    this.panelWidth = '0%';
  }

  //post script data
  getFormData(formdata: any) {
    console.log(formdata)
    this.postData("http://127.0.0.1:5000/InsertScript", formdata).subscribe(data => {
      console.log(data);
      setTimeout(() => {
        this.getAllScripts(),
          500
      })
    }, error => {
      if (error.status == 401) {
        console.log(error)
        localStorage.removeItem("token")
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    });


  }


  // get all script details
  getAllScripts() {
    this.getData("http://127.0.0.1:5000/GetAllScripts").subscribe(data => {
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
        this.filterByStatus("1")

      }
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
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

  // code to run the script by play button
  startProgram(id: any, scriptName: any) {

    this.confirmationService.confirm({
      message: `Are you sure you want to Start ${scriptName} Script?`,
      accept: () => {
        this.getData(`http://127.0.0.1:5000/StartProgram/${id}`).subscribe(data => {
        }, error => {
          if (error.status == 401) {
            console.log(error)
            this.router.navigate(["/StockAutoPilotLogin"])
          }
        })
        this.updateScriptStatus(id, 1)
      }
    });
  }

  // code for edit script
  updateScript(scriptForm: any) {
    scriptForm.id = this.scriptData.id
    scriptForm.scriptName = this.scriptData.scriptName
    console.log(scriptForm)
    this.putData("http://127.0.0.1:5000/UpdateScriptById", scriptForm).subscribe(data => {
      this.getAllScripts();
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })

  }
  // filter for script name - start date on manage script form
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
  // functionality on isdeleted status dropdown
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


  //code for activeflag update
  updateStatus(id: any, status: any) {
    let data = { scriptId: id, activeStatus: status }
    this.postData("http://127.0.0.1:5000/UpdateActiveStatus", data).subscribe(response => {
      console.log(response)
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }

  //get particular script by id for view and edit form
  getScriptById(id: any, mode: any) {

    this.getData(`http://127.0.0.1:5000/GetScriptById/${id}`).subscribe(data => {
      console.log(data)
      this.scriptData = data
      this.getTransactionById(id)
      this.getProfitByScriptById(id)
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })

    if (mode == 1) {
      this.isOnView = true
    }
    else if (mode == 2) {
      this.isOnEdit = true
      // this.openNav();
    }

  }
  // to get all script code for dropdown
  getAlllScriptCodes() {
    this.getData("http://127.0.0.1:5000/GetAllScriptCode").subscribe(data => {
      this.scriptCodes = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }

  getAllStatusCodes() {
    this.getData("http://127.0.0.1:5000/GetAllScriptCode").subscribe(data => {
      this.statusCodes = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }
  //get transactions details by id
  getTransactionById(id: any) {

    this.getData(`http://127.0.0.1:5000/getTransactionById/${id}`).subscribe(data => {
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
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })

  }

  //get current price by script id
  getCurrentPriceByScriptId(id: any) {
    this.getData(`http://127.0.0.1:5000/getCurrentpriceByscriptId/${id}`).subscribe(data => {
      this.CurrentPriceData = data
      console.log(data);
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })

  }

  // delete script by id
  delete(id: any) {
    this.getData(`http://127.0.0.1:5000/GetScriptById/${id}`).subscribe(data => {
      this.scriptData = data
      this.confirmationService.confirm({

        message: `Are you sure that you want to delete this script?${this.scriptData.scriptName} which was average bought at ${this.scriptData.avgPrice} will be sold at ${this.scriptData.currentprice} `,
        accept: () => {
          const params = new HttpParams().set("id", id)
            .set("qty", this.scriptData.quantityBalance)
            .set("scriptName", this.scriptData.scriptName)
          this.deleteData("http://127.0.0.1:5000/DeleteScriptById", params).subscribe(data => {
            setTimeout(() => {
              this.getAllScripts();
            }, 500);
            console.log(data)
          })
        }
      })
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }
  // code for update script status for pause functionality
  updateScriptStatus(id: any, status: any) {

    const params = new HttpParams().set("id", id)
      .set("status", status)
    this.getDataWithParams("http://127.0.0.1:5000/UpdateScriptStatusById", params).subscribe(data => {

      setTimeout(() => {
        this.getAllScripts();
      }, 500);
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }

  // code  to get current price for selected script 
  getCurrentPriceForSelectedScript(scriptName: any) {
    const params = new HttpParams().set("code", scriptName.code)
    this.getDataWithParams("http://127.0.0.1:5000/currentPriceForSelectedScript", params).subscribe(data => {
      this.selectedScriptCP = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }

  // CODE FOR  GET PROFIT BY SCRIPT ID

  getProfitByScriptById(id: any) {
    this.getData(`http://127.0.0.1:5000
    /getProfitByScriptId/${id}`).subscribe(data => {
      console.log(data);
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
    })
  }

  getSelectedScript(scriptName: string) {
    console.log(scriptName)
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