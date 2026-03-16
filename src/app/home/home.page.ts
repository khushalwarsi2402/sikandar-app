import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { InventoryService } from '../services/inventory.service';
import { finalize } from 'rxjs/operators';

// 1. Define an interface for type safety
export interface InventoryItem {
  id?: string | number;
  name: string;
  price: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [NgIf, NgForOf, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner],
})
export class HomePage {
  // 2. Apply the interface to your array
  inventory: InventoryItem[] = []; 
  loading = false;

  constructor(private inventorySvc: InventoryService, private toastCtrl: ToastController) {}

  loadInventory() {
    this.loading = true;
    
    this.inventorySvc.getInventory()
      .pipe(
        // 3. finalize runs whether the request succeeds or fails
        finalize(() => this.loading = false) 
      )
      .subscribe({
        next: (data: InventoryItem[]) => {
          this.inventory = data || [];
          console.log('Data loaded!', this.inventory);
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          // Fall back to demo data
          this.inventory = [
            { name: 'Shoulder Chops', price: 420 },
            { name: 'Leg Roast', price: 390 },
            { name: 'Rib Cut', price: 480 }
          ];
          console.warn('Using demo inventory due to fetch error.');
          this.showToast('Could not connect to the Node.js server — showing demo data.');
        }
      });
  }

  private async showToast(message: string, duration = 3000) {
    const t = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom'
    });
    await t.present();
  }

  trackByIndex(_: number, item: InventoryItem) {
    return item?.id ?? item?.name ?? _;
  }
}