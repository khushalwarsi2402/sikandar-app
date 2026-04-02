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
  private alertCtrl: AlertController, // Make sure this is here!
  private toastCtrl: ToastController,
  private http: HttpClient
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
  console.log("Lock clicked. Current Admin Status:", this.isAdmin);

  if (this.isAdmin) {
    this.isAdmin = false;
    this.showToast('Inventory Locked');
    return;
  }

  try {
    const alert = await this.alertCtrl.create({
      header: 'Admin Access',
      backdropDismiss: false, // This prevents accidental closing
      inputs: [
        {
          name: 'pin',
          type: 'password',
          placeholder: '****',
          attributes: {
            inputmode: 'numeric',
            maxlength: 4
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => { console.log('User cancelled'); }
        },
        {
          text: 'Unlock',
          handler: (data: any) => {
            if (data.pin === '2404') {
              this.isAdmin = true;
              this.showToast('Unlocked!');
              return true;
            } else {
              this.showToast('Wrong PIN!');
              return false; // Keeps alert open
            }
          }
        }
      ]
    });

    await alert.present();
    console.log("Alert presented successfully");

  } catch (error) {
    console.error("Alert failed to open:", error);
  }
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