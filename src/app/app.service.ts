import {Injectable} from "@angular/core";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {Headers, Http} from "@angular/http";
import {GardenQuotaService} from "./garden-quota.service";

@Injectable()
export class AppService {
  private persons: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private priorityQueue: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(http: Http, private gardenService: GardenQuotaService) {
    const options = {headers: new Headers({'Accept': 'application/json'})};

    http.get('assets/raw-data.json', options)
      .map((response) => {
        const rawData = response.json();

        const persons = [];
        const priorityQueue = {};

        for (const person of rawData) {
          persons.push(person.personalNo);

          const priority = AppService.computePriority(person.priorities);

          for (const choice of person.choices) {
            const garden = choice.garden;
            if (choice.place !== 0) {
              if (priorityQueue[garden] === undefined) {
                priorityQueue[garden] = [];
              }
              priorityQueue[garden].push({personalNo: person.personalNo, priority: priority, place: choice.place});
            }
          }
        }

        this.persons.next(persons);

        for (const garden of Object.keys(priorityQueue)) {
          priorityQueue[garden].sort(AppService.compareByPriorityAndPlaceDesc);
        }

        console.log(priorityQueue['Gėlynas']);

        return priorityQueue;
      })
      .subscribe(this.priorityQueue);

    this.computeChances('1009065470').subscribe((result) => {
      console.log(result);
    });
  }

  public computeChances(personalNo: string): Observable<any> {
    return this.priorityQueue
      .take(1)
      .combineLatest(this.gardenService.getQuotas(), (priorityQueue, gardenQuotas) => {
        return AppService.computeChances(priorityQueue, gardenQuotas, personalNo);
      });
  }

  private static computePriority(priorities: boolean[]) {
    return priorities.reduce((prevValue, isPriority) => {
      return (isPriority ? (prevValue + 1) : prevValue);
    }, 0);
  }

  private static compareByPriorityAndPlaceDesc(left, right) {
    if (left.priority > right.priority) {
      return -1;
    }

    if (left.priority < right.priority) {
      return 1;
    }

    if (left.priority === right.priority) {
      return (left.place - right.place) < 0 ? 1 : -1;
    }
  }

  private static findQueuePlace(queue, personalNo: string): number {
    return queue.findIndex((person) => {
      return person.personalNo === personalNo;
    });
  }

  private static getGardenQuota(gardenQuotas, garden) {
    if (gardenQuotas[garden] !== undefined) {
      return gardenQuotas[garden];
    }
    console.log('Missing quota for "' + garden + '"');
    return 0;
  }

  private static computeChances(priorityQueue, gardenQuotas, personalNo, queuePlaceCache = {}): any[] {
    const chances = [];

    function getQueuePlace(garden, personalNo_) {
      if (queuePlaceCache[garden] === undefined) {
        queuePlaceCache[garden] = {};
      }

      const gardenQueue = queuePlaceCache[garden];

      if (gardenQueue[personalNo_] === undefined) {
        return (gardenQueue[personalNo_] = AppService.findQueuePlace(priorityQueue[garden], personalNo_));
      }
      return gardenQueue[personalNo_];
    }

    for (const chosenGarden of Object.keys(priorityQueue)) {
      const gardenQueue = priorityQueue[chosenGarden];

      // const queuePlace = AppService.findQueuePlace(gardenQueue, personalNo);
      const queuePlace = getQueuePlace(chosenGarden, personalNo);
      let realPlace = queuePlace;

      if (realPlace !== -1) {
        const gardenQuota = AppService.getGardenQuota(gardenQuotas, chosenGarden);
        const relatedInfo = gardenQueue[queuePlace];
        for (let i = 0; i < queuePlace; i++) {
          const person = gardenQueue[i];
          for (const garden of Object.keys(priorityQueue)) {
            if (garden !== chosenGarden) {
              // const j = AppService.findQueuePlace(priorityQueue[garden], person.personalNo);
              const j = getQueuePlace(garden, person.personalNo);

              if (j !== -1 && j < i) {
                --realPlace;
                break;
              }
            }
          }
        }
        chances.push({
          garden: chosenGarden,
          quota: gardenQuota,
          place: relatedInfo.place,
          realPlace: realPlace,
          priority: relatedInfo.priority,
          chance: AppService.computeChance(gardenQuota, realPlace)
        });
      }
    }

    console.log(queuePlaceCache);

    return chances;
  }

  private static computeChance(quota, place) {
    if (place >= quota) {
      return 0;
    }
    return Math.round(100 - ((quota - place) / quota) * 100);
  }
}
