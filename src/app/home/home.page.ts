import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Required for *ngIf and *ngFor
import { FormsModule } from '@angular/forms';   // Required for [(ngModel)]
import { ToastController, AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonList, IonListHeader, IonAvatar, IonBadge, IonSpinner, IonButtons 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, trashOutline, cartOutline, cart 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
    IonIcon, IonList, IonListHeader, IonAvatar, IonBadge, IonSpinner, IonButtons
  ]
})
export class HomePage implements OnInit {
  inventory: any[] = [];
  isAdmin = false; 
  loading = false;
  newItem = { name: '', price: null as number | null }; 

  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'lock-closed-outline': lockClosedOutline,
      'lock-open-outline': lockOpenOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'sync-outline': syncOutline,
      'trash-outline': trashOutline,
      'cart-outline': cartOutline,
      'cart': cart
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

 async toggleAdmin() {
  // 1. If we are already an Admin, just lock it back up immediately.
  if (this.isAdmin) {
    this.isAdmin = false;
    this.showToast('Admin Mode: Locked');
    return;
  }

  // 2. If we are NOT an admin, ask for the secret PIN.
  const alert = await this.alertCtrl.create({
    header: 'Admin Authentication',
    subHeader: 'Enter PIN to update stock',
    inputs: [
      {
        name: 'pin',
        type: 'password',
        placeholder: '2404',
        attributes: {
          inputmode: 'numeric',
          maxlength: 4,
          style: 'text-align: center; font-size: 20px;'
        }
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Unlock',
       handler: (data: any) => {
          // Change '1234' to whatever secret code you want!
          if (data.pin === '1234') {
            this.isAdmin = true;
            this.showToast('Admin Mode: Unlocked');
            return true;
          } else {
            this.showToast('Incorrect PIN! Access Denied.');
            return false; // Keeps the alert open
          }
        }
      }
    ]
  });

  await alert.present();
}

  loadInventory() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
      },
      error: () => {
        this.showToast('Server is sleeping. Try refreshing!');
        this.loading = false;
      }
    });
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.price) return;
    this.http.post(this.apiUrl, this.newItem).subscribe({
      next: () => {
        this.newItem = { name: '', price: null };
        this.loadInventory();
        this.showToast('Item Added!');
      }
    });
  }

  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadInventory()
    });
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000 });
    toast.present();
  }
}