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

  getVisualPercent(a, b, correlation) {
    let p = (Math.round(a / b * 100));
    let r = 100 - p;
    // we visually should correlate the chance. Every value above 0 is a penalty. Penalty can be 2 or 3
    let penalty = 1;
    if (correlation > 0) {
       penalty = a > (b / 2) ? 2 : 3;
    }
    else {penalty = 0.7}
    
    let res = Math.round(r / penalty);
// console.log('percent:', p, 'inverted', r, 'with penalty', res);
    return res < 100 ? res:100;
  }

  getChanceText(relative, total) {
    let text: string = 'Very Low';
    
    if (relative <= 0) {
      // group = 0;
      text = 'High'
    }  
  

    if (relative > 0 && relative < 3) {
      // group = 1;
      text = 'Medium'
    }

    if (relative >= 4 && relative < total / 3) {
      // group = 2;
      text = 'Low'
    }

      
    return text;
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
