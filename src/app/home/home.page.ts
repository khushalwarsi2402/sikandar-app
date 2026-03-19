import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';

// 1. Core Angular HTTP tool
import { HttpClient } from '@angular/common/http';

// 2. Ionic UI tools
import { ToastController } from '@ionic/angular/standalone'; 

// 3. RxJS tools (for that 'finalize' operator in your code)
import { finalize } from 'rxjs/operators';

// 4. Your custom service from the services folder!
import { InventoryService } from '../services/inventory.service';

// ✨ CLEANED UP: Removed IonSpinner, IonCard, IonInput, etc.
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonList, IonItem, IonLabel, 
  IonAvatar, IonBadge, IonListHeader, IonIcon, IonText 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  // ✨ CLEANED UP: Removed them from this list too!
  imports: [
    NgIf, NgForOf, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonList, IonItem, IonLabel, 
    IonAvatar, IonBadge, IonListHeader, IonIcon, IonText 
  ],
})
export class HomePage {
  inventory: any[] = []; 
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
    this.http.get<any[]>(this.apiUrl)
      .pipe(
        finalize(() => this.loading = false) 
      )
      .subscribe({
        next: (data: any[]) => {
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

  trackByIndex(_: number, item: any) {
    return item?.id ?? item?.name ?? _;
  }
}