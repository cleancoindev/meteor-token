import { Component, Inject }         from '@angular/core';
import { Router }            from '@angular/router';
import { PaginationService } from 'ng2-pagination';

import { Token }  from 'both/models';
import { Tokens } from 'both/collections';

import { ListForm } from '..';

@Component({
  selector: 'partner-token-form',
  templateUrl: './partner-token-form.html'
})
export class PartnerTokenForm extends ListForm {

  constructor(
    readonly router: Router,
    @Inject(PaginationService) protected paginationService: PaginationService
  ) {
    super(
      paginationService,
      Tokens,
      'partner-tokens',
      {},
      { nft_id: -1 }
    );
  }

  click(token: Token): void {
    this.router.navigate(['/token', token._id]);
  }  

  delete(token: Token): void {
  }

}