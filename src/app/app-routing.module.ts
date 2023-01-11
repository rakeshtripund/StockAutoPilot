import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TransactionComponent } from './transaction/transaction.component';

const routes: Routes = [
  { path: 'StockAutoPilotLogin', component: LoginComponent },
  { path: 'StockAutoPilot', component: HomeComponent },
  { path: 'TransactionReport', component: TransactionComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
