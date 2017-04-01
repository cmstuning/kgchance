import {Injectable} from "@angular/core";
import {Observable, ReplaySubject} from "rxjs";
import {Headers, Http} from "@angular/http";

@Injectable()
export class GardenService {
  private quotas: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(http: Http) {
    const options = {headers: new Headers({'Accept': 'application/json'})};
    http.get('/assets/gardens.json', options)
      .map((response) => {
        return response.json();
      })
      .subscribe(this.quotas);
  }

  public getQuotas(): Observable<any> {
    return this.quotas.asObservable();
  }
}