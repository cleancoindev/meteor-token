import { MeteorObservable }  from 'meteor-rxjs';
import { Component, Inject }         from '@angular/core';
import { PaginationService } from 'ng2-pagination';

import { Client, CLIENT_SELECTOR } from 'both/models';
import { Clients }                 from 'both/collections';

import { ListForm } from '..';


@Component({
  selector: 'partner-client-form',
  templateUrl: './partner-client-form.html'
})
export class PartnerClientForm extends ListForm {

  constructor(
    @Inject(PaginationService) protected paginationService: PaginationService
  ) {
    super(
      paginationService,
      Clients,
      'partner-clients',
      CLIENT_SELECTOR,
      { createdAt: -1 }
    );
  }

  click(client: Client): void {
    alert('Чтобы войти как Клиент,'+'\n'+'нужно выйти из текущего сеанса.');
  }  

  delete(client: Client): void {
    MeteorObservable.call('deleteClient', client._id).subscribe(() => {}, (error) => {
      this.handleError(error);
    });
  }

}