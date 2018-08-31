import { Component, Inject }         from '@angular/core';
import { PaginationService } from 'ng2-pagination';

import { Offer }  from 'both/models';
import { Offers } from 'both/collections';

import { ListForm } from '..';

@Component({
  selector: 'partner-offer-form',
  templateUrl: './partner-offer-form.html'
})
export class PartnerOfferForm extends ListForm {

  constructor(
    @Inject(PaginationService) protected paginationService: PaginationService
  ) {
    super(
      paginationService,
      Offers,
      'partner-offers',
      {},
      { validFrom: -1 }
    );
  }

  click(offer: Offer): void {
  }  

  delete(offer: Offer): void {
    Offers.remove(offer._id).subscribe(() => {
    }, (error) => {
      this.handleError(error);
    });
  }

}