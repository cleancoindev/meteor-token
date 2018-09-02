import { MeteorObservable, MongoObservable } from 'meteor-rxjs';
import { Component, OnInit, OnDestroy }      from '@angular/core';
import { Observable }                        from 'rxjs';
import { Subject }                           from 'rxjs/Subject';
import { Subscription }                      from 'rxjs/Subscription';
import { PaginationService }                 from 'ng2-pagination';

import 'rxjs/add/observable/combineLatest';

import { Item }   from 'both/models';
import { Counts } from 'both/collections';

export interface Options {
  limit: number;
  skip: number;
  sort?: Mongo.SortSpecifier;
}

@Component({
  selector: 'list-form',
  templateUrl: './list-form.html'
})
export class ListForm implements OnInit, OnDestroy {

  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortOrder: Subject<Mongo.SortSpecifier> = new Subject<Mongo.SortSpecifier>();
  
  optionsSub: Subscription;
  itemsSub: Subscription;
  countsSub: Subscription;
  autorunSub: Subscription;

  items: Observable <Item[]>;  
  count: number;
  ready: boolean;

  readonly size: number = 8;

  constructor(
    protected paginationService: PaginationService,
    protected Collection: MongoObservable.Collection<Item>,
    protected subscription: string,
    protected SELECTOR: Mongo.Selector,
    protected order: Mongo.SortSpecifier
  ) {}

  ngOnInit() {

    this.paginationService.register({
      id: this.subscription,
      itemsPerPage: this.size,
      currentPage: 1
    });
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortOrder,
    ).subscribe(([pageSize, curPage, sortOrder]) => {

      this.paginationService.setCurrentPage(this.subscription, curPage);
      if (this.itemsSub) {
        this.itemsSub.unsubscribe();
      }
      const options: Options = {
        limit: pageSize,
        skip: (curPage - 1) * pageSize,
        sort: sortOrder
      };
      this.itemsSub = MeteorObservable.subscribe(this.subscription, options).subscribe();
      this.items = this.Collection.find(this.SELECTOR, { sort: sortOrder });
    });
    this.pageSize.next(this.size);
    this.curPage.next(1);
    this.sortOrder.next(this.order);    

    this.countsSub = MeteorObservable.subscribe('count-' + this.subscription).subscribe(() => {
      this.autorunSub = MeteorObservable.autorun().subscribe(() => {

        this.count = (Counts.findOne({ subscription: this.subscription }) || { count: 0 }).count;
        this.paginationService.setTotalItems(this.subscription, this.count);
        this.ready = true;
      });
    });  
  }

  click(item: Item): void {
    alert('Метод click() не определен.');
  }  

  delete(item: Item): void {
    alert('Метод delete() не определен.');
  }  

  ngOnDestroy() {
    if (this.optionsSub) this.optionsSub.unsubscribe();
    if (this.itemsSub)   this.itemsSub.unsubscribe();
    if (this.countsSub)  this.countsSub.unsubscribe();
    if (this.autorunSub) this.autorunSub.unsubscribe();
  }

  handleError(e: Error): void {
    console.error(e);
    alert('Ошибка: ' + e.message);
  }

}