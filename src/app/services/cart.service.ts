import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: any[] = [];
  
  // A "BehaviorSubject" lets other components "watch" the cart count in real-time
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  addToCart(product: any) {
    this.cartItems.push(product);
    this.cartCount.next(this.cartItems.length);
    console.log("Cart updated:", this.cartItems);
  }

  getCart() {
    return this.cartItems;
  }

  getTotalItems() {
    return this.cartItems.length;
  }
}