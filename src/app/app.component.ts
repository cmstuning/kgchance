import { Component } from '@angular/core';
import {AppService} from "./app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  loading: boolean = false; // will use for spinner
  dataArrived: boolean = false;
  chances: any[];
  constructor(private appService: AppService) {

  }

  toggleLoading() {
    this.loading = !this.loading;
}  
  onIdSubmit(id) {
    this.toggleLoading();
    // console.log('you submitted', id);
    this.appService.computeChances(id)
      .subscribe(resp => {
        this.dataArrived = true;
        this.chances = resp;
        this.toggleLoading();
        console.log('chances calculated', resp);
      });
  }
}
