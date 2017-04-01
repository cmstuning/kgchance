import {Injectable} from "@angular/core";
import {Observable, ReplaySubject} from "rxjs";
import {Headers, Http} from "@angular/http";
import {GardenQuota} from "./garden-quota.interface";

@Injectable()
export class GardenQuotaService {
  private quotas: ReplaySubject<GardenQuota> = new ReplaySubject<GardenQuota>(1);

  constructor(http: Http) {
    const options = {headers: new Headers({'Accept': 'application/json'})};
    http.get('/assets/gardens.json', options)
      .map((response) => {
        const quotas = {};

        for (const gaden of response.json()) {
          quotas[gaden.garden] = gaden.quota;
        }
        return quotas;
      })
      .subscribe(this.quotas);
  }

  public getQuotas(): Observable<GardenQuota> {
    return this.quotas.asObservable();
  }
}