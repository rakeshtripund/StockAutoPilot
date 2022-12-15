import { HashLocationStrategy } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APP_ID, Injectable } from '@angular/core';
import { noop } from 'rxjs';
import { HotObservable } from 'rxjs/internal/testing/HotObservable';

@Injectable()
export class HomeService {

  constructor(private http: HttpClient) { }

  postData(url: string, body: any) {
    return this.http.post(url, body);
  }

  getData(url: string,) {
    return this.http.get(url);
  }

  getDataWithParams(url: string, parameters: HttpParams) {
    return this.http.get(url, { params: parameters });
  }
}
