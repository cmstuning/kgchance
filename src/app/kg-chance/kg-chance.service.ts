import {Injectable} from "@angular/core";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {Headers, Http} from "@angular/http";
import {KgQuotaService} from "./kg-quota.service";

@Injectable()
export class KgChanceService {
  private persons: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private priorityQueue: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(http: Http, private gardenService: KgQuotaService) {
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
              const gardenPriority = AppService.computePriority(choice.priorities);
              if (priorityQueue[garden] === undefined) {
                priorityQueue[garden] = [];
              }
              priorityQueue[garden].push({
                personalNo: person.personalNo,
                priority: (priority + gardenPriority),
                place: choice.place
              });
            }
          }
        }

        this.persons.next(persons);

        for (const garden of Object.keys(priorityQueue)) {
          // priorityQueue[garden].sort(AppService.compareByPriorityAndPlaceDesc);
          priorityQueue[garden].sort(AppService.compareByPlaceAsc);
        }

        return priorityQueue;
      })
      .subscribe(this.priorityQueue);

    // this.computeChances('1009065470').subscribe((result) => {
    //   console.log(result);
    // });
  }

  public computeChances(personalNo: string): Observable<any> {
    return this.priorityQueue
      .take(1)
      .combineLatest(this.gardenService.getQuotas(), (priorityQueue, gardenQuotas) => {
        const result = AppService.computeChances(priorityQueue, gardenQuotas, personalNo);

        if (result.length === 0) {
          return Observable.throw(new Error('There are no data'));
        }
        return Observable.of(result);
      })
      .switch();
  }

  private static computePriority(priorities: boolean[]) {
    return priorities.reduce((prevValue, isPriority) => {
      return (isPriority ? (prevValue + 1) : prevValue);
    }, 0);
  }

  private static compareByPlaceAsc(left, right) {
    if (left.place < right.place) {
      return -1;
    }

    if (left.place > right.place) {
      return 1;
    }

    return 0;
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

      if (queuePlace !== -1) {
        const gardenQuota = AppService.getGardenQuota(gardenQuotas, chosenGarden);
        const relatedInfo = gardenQueue[queuePlace];
        for (let i = 0; i < queuePlace; i++) {
          const person = gardenQueue[i];
          for (const garden of Object.keys(priorityQueue)) {
            if (garden !== chosenGarden) {
              // const j = AppService.findQueuePlace(priorityQueue[garden], person.personalNo);
              const j = getQueuePlace(garden, person.personalNo);

              if (j !== -1) {
                if (j < AppService.getGardenQuota(gardenQuotas, garden)) {
                  --realPlace;
                  break;
                }
              }

              // if (j !== -1 && j < i) {
              //   --realPlace;
              //   break;
              // }
            }
          }
        }
        chances.push({
          garden: chosenGarden,
          quota: gardenQuota,
          place: relatedInfo.place,
          realPlace: realPlace,
          priority: relatedInfo.priority,
          queueLength: gardenQueue.length,
          realQueueLength: gardenQueue.length - (relatedInfo.place - realPlace),
          // chance: AppService.computeChance(gardenQuota, realPlace),
          relative: realPlace - gardenQuota
        });
      }
    }

    return chances;
  }

  // private static computeChance(queueLength, place) {
  //   return Math.round((queueLength - place) / queueLength * 100.0);
  // }
}
