import {Component, OnInit} from '@angular/core';
import {LangService} from '../shared/lang.service';
import {BigCartService} from "../shared/big-cart.service";

import {IBigCart, IBigCartItem} from "../custom-types/index";

@Component({
    selector: 'big-cart',
    templateUrl: 'big-cart.component.html',
    styleUrls: ['big-cart.component.css']
})
export class BigCartComponent implements OnInit {
    public lang: {
        [key:string]:string
    };
    public result: IBigCart = {
        summ: 0,
        items: []
    };

    public constructor(public langService: LangService,
                public bigCartService: BigCartService) {}

    public ngOnInit() {
        this.lang = this.langService.phrases;

        this.bigCartService.getResult()
            .subscribe((result: IBigCart) => {

                this.result.items = result.items;

                this.result.items.forEach((item:IBigCartItem)=>{
                    if (typeof item.quantity !== "number") {
                        item.quantity.subscribe(() => {
                            this.result.summ = this.bigCartService.calculateSumm(this.result.items);
                          })
                    }
                });

            });
    }

    public deleteItem(id:number):boolean{
        this.result.items = this.result.items.filter((item:IBigCartItem)=>{
            return item.id !== id;
        });
        this.result.summ = this.bigCartService.calculateSumm(this.result.items);
        return false;
    }
}
