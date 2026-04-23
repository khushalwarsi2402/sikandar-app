/// <reference types="jasmine" />
// 1. All Imports stay at the very top!
import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HomePage } from './home.page';

describe('HomePage (unit)', () => {
  let fakeSvc: any;
  let fakeToast: any;
  let page: HomePage;

  // 2. beforeEach always goes at the start of the describe block
  beforeEach(() => {
    fakeSvc = { getInventory: jasmine.createSpy('getInventory') };
    fakeToast = { 
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() })) 
    };
    const fakeHttpClient = {} as any;
    page = new HomePage(fakeSvc, fakeToast as any, fakeHttpClient);
    page.inventory = [];
  });

  // 3. Test 1: The "Happy Path"
  it('loads inventory on success', fakeAsync(() => {
    const mock = [{ name: 'Premium Mutton', price: 750 }];
    fakeSvc.getInventory.and.returnValue(of(mock));

    page.loadInventory();
    
    tick(); // Fast-forward time to resolve the Observable

    expect(page.inventory).toEqual(mock);
  }));

  // 4. Test 2: The "Sad Path" (Error handling)
  it('falls back to demo data on error and shows toast', fakeAsync(() => {
    fakeSvc.getInventory.and.returnValue(throwError(() => new Error('fail')));

    page.loadInventory();
    
    tick(); // Fast-forward time to resolve the Error

    expect(page.inventory.length).toBeGreaterThan(0);
    expect(fakeToast.create).toHaveBeenCalled();
  }));
});