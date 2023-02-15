import { Component } from '@angular/core';
import { Script } from './Models/script.model';
import { ConfirmationService, MessageService } from 'primeng/api';

import { timer } from 'rxjs';
import { HttpClient, HttpParams, HttpXsrfTokenExtractor, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

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
  obsTimer: Observable<number> = timer(1000, 300 * 1000); //300 
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
  resetCriteriaInput: any
  stop_loss_input: any
  stopLossInput: any
  rejectFlag: boolean = true
  addFormResetInput: any
  notificationList: any
  scriptProfit: any


  constructor(private http: HttpClient, private confirmationService: ConfirmationService, public router: Router, private messageService: MessageService) { }

  ngOnInit(): void {
    this.obsTimer.subscribe(() => {
      this.startProgram();
    });
    this.title = 'Add Script'
    this.title_form = 'Script Name';
    this.resetFilter();
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
    this.statuses = ['Paused', 'Saved', 'Live', 'Closed', 'Deleted'];
    this.orderstatus = ['Buy', 'Sell'];
    this.rejectFlag = false
    this.addFormResetInput = 0
  }

  //open add script function
  openNav() {
    this.panelWidth = '50%';


  }
  //close add script function 
  closeNav() {
    this.panelWidth = '0%';
    this.rejectFlag = true
    this.scriptData = {}
    this.selectedScript = {}
    this.selectedScriptCP = {};

  }

  //post script data
  getFormData(formdata: any) {
    console.log(formdata.specific)
    if (!formdata.specificValue) {
      formdata.specificValue = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    if (!formdata.marginalValue) {
      formdata.marginalValue = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    formdata.resetCriteria = this.addFormResetInput
    // if (!formdata.stop_loss_percentage) {
    //   formdata.stop_loss_percentage = 0
    // }
    // if (!formdata.stop_loss_value) {
    //   formdata.stop_loss_value = 0
    // }
    if (!formdata.market_rate_stoploss) {
      formdata.market_rate_stoploss = 0
    }
    console.log(formdata)
    this.confirmationService.confirm({
      message: `Are you sure you want to Add Script?`,
      accept: () => {
        this.postData(environment.baseUrl + "InsertScript", formdata).subscribe(data => {
          console.log(data);
          this.messageService.add({ severity: 'success', summary: "Script Added  Successfully" });
          if (data == "Success") {
            this.closeNav();
            this.scriptData = {};
            this.selectedScript = {};
            this.selectedScriptCP = {};

            setTimeout(() => {
              this.getAllScripts(),
                500
            })
          }

          else {
            console.log(data)
          }
        }, error => {
          if (error.status == 401) {
            console.log(error)
            localStorage.removeItem("token")
            this.router.navigate(["/StockAutoPilotLogin"])
          }
          else if (error.status == 500) {
            console.log(error.error.Error)
            this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

          }
        });
      },
      reject: () => {
        this.rejectFlag = true
        this.scriptData = {}
        this.selectedScript = {}
        this.selectedScriptCP = {};
        this.closeNav();
      }

    });

  }

  // get all script details
  getAllScripts() {
    this.getData(environment.baseUrl + "GetAllScripts").subscribe(data => {
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
        else if (script.activeFlag == 2) {
          script.activeFlag = 'Closed'
        }
        else if (script.activeFlag == 3) {
          script.activeFlag = 'Deleted'
        }
        this.filterByStatus("1")

      }
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

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
    this.getAllScripts()
    this.isOnEdit = false
    this.isOnView = false
    this.scriptData = {}
  }

  // code to run the script by play button
  // startProgram(id: any, scriptName: any) {

  //   this.confirmationService.confirm({
  //     message: `Are you sure you want to Start ${scriptName} Script?`,
  //     accept: () => {
  //       this.getData(`http://127.0.0.1:8001/StartProgram/${id}`).subscribe(data => {
  //       }, error => {
  //         if (error.status == 401) {
  //           console.log(error)
  //           this.router.navigate(["/StockAutoPilotLogin"])
  //         }
  //       })
  //       this.updateScriptStatus(id, 1)
  //     }
  //   });
  // }
  startProgram() {
    this.getData(environment.baseUrl + "StartProgram").subscribe(data => {
      this.notificationList = data
      if (!this.notificationList.message) {
        console.log("Notification list", this.notificationList)
        for (let notification of this.notificationList) {
          console.log(notification.scriptName)
          console.log(notification.message)
          this.messageService.add({ severity: 'success', summary: notification.scriptName, detail: notification.message });
        }
      }
      this.getData(environment.baseUrl + "updateScriptsCurrentPrice").subscribe(data => {
        setTimeout(() => {
          this.getAllScripts();
        }, 500)
      })
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }



  // code for edit script
  updateScript(scriptForm: any) {
    scriptForm.id = this.scriptData.id
    scriptForm.scriptName = this.scriptData.scriptName
    scriptForm.sm2Flag = this.scriptData.sm2Flag
    if (!scriptForm.specificValue) {
      scriptForm.specificValue = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    if (!scriptForm.marginalValue) {
      scriptForm.marginalValue = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    if (!scriptForm.stop_loss_value) {
      scriptForm.stop_loss_value = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    if (!scriptForm.stop_loss_percentage) {
      scriptForm.stop_loss_percentage = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    if (!scriptForm.marketRateStoploss) {
      scriptForm.marketRateStoploss = 0; // above code is to check if formdata.specificValue is present or not if not present then value must be 0
    }
    scriptForm.stop_loss = this.stop_loss_input
    scriptForm.resetCriteria = this.resetCriteriaInput
    scriptForm.marginalValue = this.scriptData.marginalValue
    scriptForm.specificValue = this.scriptData.specificValue
    // scriptForm.stop_loss_value = this.scriptData.stop_loss_value
    // scriptForm.stop_loss_percentage = this.scriptData.stop_loss_percentage
    scriptForm.marketRateStoploss = this.scriptData.marketRateStoploss

    console.log(scriptForm)
    console.log(this.scriptData.specificValue)
    console.log(this.scriptData.marginalValue)
    // console.log(this.scriptData.stop_loss_value)
    // console.log(this.scriptData.stop_loss_percentage)

    this.confirmationService.confirm({
      message: `Are you sure you want to Update the Script`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        this.putData(environment.baseUrl + "UpdateScriptById", scriptForm).subscribe(data => {
          this.getAllScripts();
          this.messageService.add({ severity: 'success', summary: "Updated  Successfully" });
        }, error => {
          if (error.status == 401) {
            console.log(error)
            this.router.navigate(["/StockAutoPilotLogin"])
          }
          else if (error.status == 500) {
            console.log(error.error.Error)
            this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

          }
        })
        this.resetCriteriaInput = ""
        this.stop_loss_input = ""

      }
    });
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
  resetFilter() {
    this.filter = {
      scriptName: '',
      startDate: '',

    };
    this.getAllScripts();
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



  //code for activeflag update
  updateStatus(id: any, status: any) {
    let data = { scriptId: id, activeStatus: status }
    this.postData(environment.baseUrl + "UpdateActiveStatus", data).subscribe(response => {
      console.log(response)
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });
      }

    })
    setTimeout(() => {
      this.getAllScripts(),
        500
    })

  }

  //get particular script by id for view and edit form
  getScriptById(id: any, mode: any) {

    this.getData(`${environment.baseUrl}GetScriptById/${id}`).subscribe(data => {
      console.log(data)
      this.scriptData = data
      this.resetCriteriaInput = this.scriptData.resetCriteria
      this.stop_loss_input = this.scriptData.stop_loss
      this.getTransactionById(id)
      this.getProfitByScriptById(id)
      if (mode == 1) {
        this.isOnView = true
      }
      else if (mode == 2) {
        this.isOnEdit = true
        // this.openNav();
      }
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })



  }
  // to get all script code for dropdown
  getAlllScriptCodes() {
    this.getData(environment.baseUrl + "GetAllScriptCode").subscribe(data => {
      this.scriptCodes = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });
      }
    })
  }

  getAllStatusCodes() {
    this.getData(environment.baseUrl + "GetAllScriptCode").subscribe(data => {
      this.statusCodes = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }
  //get transactions details by id
  getTransactionById(id: any) {

    this.getData(`${environment.baseUrl}getTransactionById/${id}`).subscribe(data => {
      this.transactionData = data
      for (let transaction of this.transactionData) {
        transaction.orderDate = new Date(transaction.orderDate)
        console.log(transaction.orderDate)
        transaction.orderDate = (transaction.orderDate).toUTCString() + "+0530";
        console.log(transaction.orderDate)
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
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })

  }

  //get current price by script id
  getCurrentPriceByScriptId(id: any) {
    this.getData(`${environment.baseUrl}getCurrentpriceByscriptId/${id}`).subscribe(data => {
      this.CurrentPriceData = data
      console.log(data);
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })

  }

  // delete script by id
  delete(id: any) {

    this.getData(`${environment.baseUrl}getScriptById/${id}`).subscribe(data => {
      this.scriptData = data
      this.confirmationService.confirm({

        message: `Are you sure that you want to delete this script?${this.scriptData.scriptName} which was average bought at ${this.scriptData.avgPrice} will be sold at ${this.scriptData.currentprice} `,
        accept: () => {
          const params = new HttpParams().set("id", id)
            .set("qty", this.scriptData.quantityBalance)
            .set("scriptName", this.scriptData.scriptName)
            .set("status", this.scriptData.activeFlag)
          this.deleteData(environment.baseUrl + "DeleteScriptById", params).subscribe(data => {
            setTimeout(() => {
              this.getAllScripts();
            }, 500);
            this.messageService.add({ severity: 'success', summary: "Script Deleted Successfully" });

            console.log(data)
          })
        }
      })
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }
  // code for update script status for pause functionality
  updateScriptStatus(scriptName: any, id: any, status: any) {
    const params = new HttpParams().set("id", id)
      .set("status", status)
    let msg = ""
    if (status == 1) {
      msg = `Are you sure you want to Start ${scriptName} Script?`
    }
    else if (status == 0) {
      msg = `Are you sure you want to Pause ${scriptName} Script?`
    }
    this.confirmationService.confirm({
      message: msg,
      accept: () => {
        this.getDataWithParams(environment.baseUrl + "UpdateScriptStatusById", params).subscribe(data => {
          setTimeout(() => {
            this.getAllScripts();
          }, 500);
        }, error => {
          if (error.status == 401) {
            console.log(error)
            this.router.navigate(["/StockAutoPilotLogin"])
          }
          else if (error.status == 500) {
            console.log(error.error.Error)
            this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });
          }
        })
      }
    });
  }

  // code  to get current price for selected script 
  getCurrentPriceForSelectedScript(scriptName: any) {
    const params = new HttpParams().set("code", scriptName.code)
    this.getDataWithParams(environment.baseUrl + "currentPriceForSelectedScript", params).subscribe(data => {
      this.selectedScriptCP = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }

  // CODE FOR  GET PROFIT BY SCRIPT ID

  getProfitByScriptById(id: any) {
    this.getData(`${environment.baseUrl}getProfitByScriptId/${id}`).subscribe(data => {
      this.scriptProfit = data
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });

      }
    })
  }
  // CODE FOR LOGOUT FUNCTIONALITY
  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/StockAutoPilotLogin"]);
  }

  switchResetInputFields(value: any) {
    console.log(value)
    console.log(this.resetCriteriaInput)
    this.resetCriteriaInput = value

  }
  switchAddFormReset(indicator: any) {
    this.addFormResetInput = indicator
  }



  // switchStoplossInputFields(value: any) {
  //   console.log(value)
  //   console.log(this.stop_loss_input)
  //   this.stop_loss_input = value
  // }

  getSelectedScript(scriptName: string) {
    console.log(scriptName)
  }

  addTransactionFund(id: number, fund: any) {
    let data = { scriptId: id, scriptFund: fund }
    this.postData(environment.baseUrl + "addScriptFund", data).subscribe(response => {
      console.log(this.scriptData.id)
      this.getScriptById(this.scriptData.id, 2)

      this.messageService.add({ severity: 'success', summary: "Fund Added Successfully" });
    }, error => {
      if (error.status == 401) {
        console.log(error)
        this.router.navigate(["/StockAutoPilotLogin"])
      }
      else if (error.status == 500) {
        console.log(error.error.Error)
        this.messageService.add({ severity: 'error', summary: "500: Internal Server Error", detail: error.error.Error });
      }

    })

  }

  // getScriptProfit() {
  //   this.getData("http://127.0.0.1:8001/getScriptProfit").subscribe(data => {
  //     console.log(data)
  //     this.scriptProfit = data
  //     console.log()
  //   }, error => {
  //     if (error.status == 500) {
  //       console.log(error.error.message)
  //       this.messageService.add({ severity: 'error', summary: "Exception", detail: error.error.Error });
  //     }

  //   })
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

  deleteData(url: string, parameters: HttpParams) {
    return this.http.delete(url, { params: parameters });
  }

}