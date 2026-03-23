import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// 1. We added AlertController and IonButtons here!
import { ToastController, AlertController } from '@ionic/angular/standalone'; 
import { finalize } from 'rxjs/operators';
import { InventoryService } from '../services/inventory.service';

import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButton, IonList, IonItem, IonLabel, 
  IonAvatar, IonBadge, IonListHeader, IonIcon, IonText,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput,
  IonButtons 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    NgIf, NgForOf, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonButton, IonList, IonItem, IonLabel, 
    IonAvatar, IonBadge, IonListHeader, IonIcon, IonText,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput,
    IonButtons
  ],
})
export class HomePage {
  inventory: any[] = []; 
  loading = false;
  isAdmin = false; // 🔒 This controls what people can see!
  
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private inventorySvc: InventoryService, 
    private toastCtrl: ToastController,
    private alertCtrl: AlertController, // Added here
    private http: HttpClient 
  ) {}

  // 🔐 THE SECURE LOGIN POPUP
  async adminLogin() {
    // If already logged in, this will log you out
    if (this.isAdmin) {
      this.isAdmin = false;
      this.showToast('Logged out securely.');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Owner Access',
      inputs: [
        { name: 'pin', type: 'password', placeholder: 'Enter Secret PIN' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Unlock',
          handler: (data) => {
            // Your secret PIN is 786 (you can change this!)
            if (data.pin === '786') { 
              this.isAdmin = true;
              this.showToast('Welcome back, Boss!');
            } else {
              this.showToast('Incorrect PIN!');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  loadInventory() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).pipe(finalize(() => this.loading = false)).subscribe({
      next: (data: any[]) => { this.inventory = data || []; },
      error: (err) => { this.showToast('Could not connect to the server.'); }
    });
  }

  addItem(name: any, price: any) {
    // 1. We split this into two lines so TypeScript doesn't get confused by the "Promise"
    if (!name || !price) {
      this.showToast('Please enter name and price!');
      return; 
    }

    // 2. Format the data for MongoDB
    const newItem = { 
      name: String(name), 
      price: Number(price) 
    };
    
    // 3. Send it to the cloud
    this.http.post(this.apiUrl, newItem).subscribe({
      next: () => {
        this.showToast('Item saved!');
        this.loadInventory(); 
      },
      error: () => this.showToast('Failed to save.')
    });
  }
  deleteItem(id: string) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    this.loading = true;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.showToast('Item deleted!');
        this.loadInventory();
      },
      error: () => {
        this.showToast('Failed to delete item.');
        this.loading = false;
      }
    });
  }

  private async showToast(message: string, duration = 2000) {
    const t = await this.toastCtrl.create({ message, duration, position: 'bottom' });
    await t.present();
  }

  trackByIndex(_: number, item: any) { return item?._id ?? _; }
}