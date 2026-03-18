import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http'; 
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonList, IonItem, IonLabel, IonSpinner,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput 
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { InventoryService } from '../services/inventory.service';
import { finalize } from 'rxjs/operators';

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
  imports: [
    NgIf, NgForOf, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonList, IonItem, IonLabel, IonSpinner,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput 
  ],
})
export class HomePage {
  inventory: InventoryItem[] = []; 
  loading = false;
  
  // YOUR LIVE API URL
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private inventorySvc: InventoryService, 
    private toastCtrl: ToastController,
    private http: HttpClient 
  ) {}

  loadInventory() {
    this.loading = true;
    
    // Now fetching from the live Render server
    this.http.get<InventoryItem[]>(this.apiUrl)
      .pipe(
        finalize(() => this.loading = false) 
      )
      .subscribe({
        next: (data: InventoryItem[]) => {
          this.inventory = data || [];
          console.log('Global data loaded!', this.inventory);
        },
        error: (err) => {
          console.error('Error fetching live data:', err);
          this.showToast('Could not connect to the live server.');
        }
      });
  }

  addItem(name: string | number | null | undefined, price: string | number | null | undefined) {
    if (!name || !price) {
      this.showToast('Please enter both a name and a price!');
      return;
    }

    const newItem = { 
      name: String(name), 
      price: Number(price) 
    };

    // Sending data to the live Render server
    this.http.post(this.apiUrl, newItem).subscribe({
      next: (response: any) => {
        this.showToast('Item saved to the cloud!');
        this.loadInventory(); 
      },
      error: (error) => {
        console.error('Error adding item:', error);
        this.showToast('Failed to save to the cloud.');
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