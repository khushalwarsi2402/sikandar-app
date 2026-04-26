import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { apiConfig } from '../../environments/environment';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryService]
    });

    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch inventory from API', () => {
    const mock = [
      { name: 'Test Cut', price: 100 }
    ];

    service.getInventory().subscribe(data => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne(`${apiConfig.apiUrl}/mutton`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
