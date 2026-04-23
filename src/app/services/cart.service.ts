import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  
  // BehaviorSubject allows the badge to update instantly across the app
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  constructor() {}

  getCart() {
    return this.cartItems;
  }

  addToCart(product: any) {
    this.cartItems.push(product);
    this.cartCount.next(this.cartItems.length);
  }

  // Removes an item by its specific position in the list
  removeFromCart(index: number) {
    if (index > -1 && index < this.cartItems.length) {
      this.cartItems.splice(index, 1);
      this.cartCount.next(this.cartItems.length);
    }
  }

  clearCart() {
    this.cartItems = [];
    this.cartCount.next(0);
  }
}