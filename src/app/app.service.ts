import {Injectable} from "@angular/core";
import {Observable, ReplaySubject, Subject} from "rxjs";
import {Headers, Http} from "@angular/http";

@Injectable()
export class AppService {
  private persons: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
  private priorityQueue: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(http: Http) {
    const options = {headers: new Headers({'Accept': 'application/json'})};

    http.get('assets/raw-data.json', options)
      .map((response) => {
        const rawData = response.json();

        const persons = [];
        const priorityQueue = {};

        for (const person of rawData) {
          persons.push(person.personalNo);

          const priority = person.priorities.reduce((prevValue, isPriority) => {
            if (isPriority) {
              return prevValue + 1;
            }
            return prevValue;
          }, 0);

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
          priorityQueue[garden].sort((left, right) => {
            if (left.priority < right.priority) {
              return -1;
            }

            if (left.priority > right.priority) {
              return 1;
            }

            if (left.priority === right.priority) {
              return (left.place - right.place) < 0 ? -1 : 1;
            }
          });
        }

        return priorityQueue;
      })
      .subscribe(this.priorityQueue);

    this.computeChancesAll().subscribe((result) => {
      console.log(result);
    });
  }

  public computeChances(personalNo: string): Observable<any> {
    return this.priorityQueue
      .take(1)
      .map((priorityQueue) => {
        return AppService.computeChances(priorityQueue, personalNo);
      });
  }

  public computeChancesAll(limit: number = 10, offset: number = 0): Observable<any[]> {
    return this.persons
      .take(1)
      .combineLatest(this.priorityQueue, (persons, priorityQueue) => {
        console.log('Hello1');
        const result = [];

        for (let i = offset; i < limit; i++) {
          const personalNo = persons[i];

          result.push({
            personalNo: personalNo,
            chances: AppService.computeChances(priorityQueue, personalNo)
          });
        }

        return result;
      });
  }

  private static findQueuePlace(queue, personalNo: string): number {
    return queue.findIndex((person) => {
      return person.personalNo === personalNo;
    });
  }

  private static computeChances(priorityQueue, personalNo): any[] {
    const chances = [];

    for (const chosenGarden of Object.keys(priorityQueue)) {
      const gardenQueue = priorityQueue[chosenGarden];
      const gardenQuota = 20;

      const queuePlace = AppService.findQueuePlace(gardenQueue, personalNo);
      let realPlace = queuePlace;

      if (realPlace !== -1) {
        const relatedInfo = gardenQueue[queuePlace];
        for (let i = 0; i < queuePlace; i++) {
          const person = gardenQueue[i];
          for (const garden of Object.keys(priorityQueue)) {
            if (garden !== chosenGarden) {
              const j = AppService.findQueuePlace(priorityQueue[garden], person.personalNo);

              if (j !== -1 && j < i) {
                --realPlace;
              }
            }
          }
        }
        chances.push({
          garden: chosenGarden,
          place: relatedInfo.place,
          priority: relatedInfo.priority,
          chance: ((realPlace + 1) < gardenQuota ? 'high' : 'low')});
      }
    }

    return chances;
  }
}
