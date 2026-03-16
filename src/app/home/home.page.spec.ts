import { of, throwError } from 'rxjs';
import { HomePage } from './home.page';

describe('HomePage (unit)', () => {
  let fakeSvc: any;
  let fakeToast: any;
  let page: HomePage;

  beforeEach(() => {
    fakeSvc = { getInventory: jasmine.createSpy('getInventory') };
    fakeToast = { create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: () => Promise.resolve() })) };
    page = new HomePage(fakeSvc, fakeToast as any);
  });

  it('loads inventory on success and clears loading', (done) => {
    const mock = [{ name: 'A', price: 1 }];
    fakeSvc.getInventory.and.returnValue(of(mock));

    page.loadInventory();

    setTimeout(() => {
      expect(page.loading).toBeFalse();
      expect(page.inventory).toEqual(mock);
      done();
    }, 0);
  });

  it('falls back to demo data on error and shows toast', (done) => {
    fakeSvc.getInventory.and.returnValue(throwError(() => new Error('fail')));

    page.loadInventory();

    setTimeout(() => {
      expect(page.loading).toBeFalse();
      expect(page.inventory.length).toBeGreaterThan(0);
      expect(fakeToast.create).toHaveBeenCalled();
      done();
    }, 0);
  });
});
