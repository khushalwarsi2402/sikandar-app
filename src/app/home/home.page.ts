import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';

// 1. Core Angular HTTP tool
import { HttpClient } from '@angular/common/http';

// 2. Ionic UI tools
import { ToastController } from '@ionic/angular/standalone'; 

// 3. RxJS tools
import { finalize } from 'rxjs/operators';

// 4. Your custom service
import { InventoryService } from '../services/inventory.service';

// ✅ RESTORED: Added the UI components needed for the "Add Stock" form
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonList, IonItem, IonLabel, 
  IonAvatar, IonBadge, IonListHeader, IonIcon, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  // ✅ RESTORED: Added to the imports array so the HTML recognizes them
  imports: [
    NgIf, NgForOf, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonList, IonItem, IonLabel, 
    IonAvatar, IonBadge, IonListHeader, IonIcon, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput
  ],
})
export class HomePage {
  inventory: any[] = []; 
  loading = false;
  
  // YOUR LIVE API URL (Render + MongoDB)
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private inventorySvc: InventoryService, 
    private toastCtrl: ToastController,
    private http: HttpClient 
  ) {}

  // Fetch data from MongoDB via Render
  loadInventory() {
    this.loading = true;
    
    this.http.get<any[]>(this.apiUrl)
      .pipe(
        finalize(() => this.loading = false) 
      )
      .subscribe({
        next: (data: any[]) => {
          // MongoDB results usually come in an array
          this.inventory = data || [];
          console.log('Database data loaded!', this.inventory);
        },
        error: (err) => {
          console.error('Error fetching live data:', err);
          this.showToast('Could not connect to the live server.');
        }
      });
  }

  // Save new item to MongoDB via Render
  addItem(name: any, price: any) {
    if (!name || !price) {
      this.showToast('Please enter both a name and a price!');
      return;
    }

    const newItem = { 
      name: String(name), 
      price: Number(price) 
    };

    this.http.post(this.apiUrl, newItem).subscribe({
      next: () => {
        this.showToast('Item saved to MongoDB!');
        this.loadInventory(); // Refresh the list automatically
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

  // Helper for smooth list rendering
  trackByIndex(_: number, item: any) {
    return item?._id ?? item?.name ?? _;
  }
}