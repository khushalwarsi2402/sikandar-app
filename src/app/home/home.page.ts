import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { lockClosedOutline, lockOpenOutline, cloudUploadOutline, syncOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  inventory: any[] = [];
  loading = false;
  isAdmin = false;
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {
    // Icons properly registered here!
    addIcons({
      'lock-closed-outline': lockClosedOutline,
      'lock-open-outline': lockOpenOutline,
      'cloud-upload-outline': cloudUploadOutline,
      'sync-outline': syncOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  // 🔐 Admin Login Logic
  async adminLogin() {
    if (this.isAdmin) {
      this.isAdmin = false;
      this.showToast('Logged out of Admin Mode');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Admin Access',
      inputs: [
        { name: 'pin', type: 'password', placeholder: 'Enter PIN' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Login',
          handler: (data) => {
            if (data.pin === '786') {
              this.isAdmin = true;
              this.showToast('Admin Mode Unlocked!');
            } else {
              this.showToast('Incorrect PIN');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // 🔄 READ: Get Items from Server
  loadInventory() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => {
      this.inventory = data;
    });
  }

  // ➕ CREATE: Send New Item to Server
  addItem(name: string, price: string) {
    if (!name || !price) {
      this.showToast('Please enter both name and price');
      return;
    }
    this.http.post(this.apiUrl, { name, price: Number(price) }).subscribe(() => {
      this.showToast('Item added to MongoDB!');
      this.loadInventory();
    });
  }

  // 🗑️ DELETE: Tell Server to Remove Item
  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.showToast('Item deleted!');
      this.loadInventory();
    });
  }

  // ✏️ UPDATE (Part 1): Show Edit Popup
  async editPrice(item: any) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Price',
      subHeader: item.name,
      inputs: [
        {
          name: 'newPrice',
          type: 'number',
          placeholder: 'Enter new price',
          value: item.price
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (data.newPrice) {
              this.sendUpdatedPrice(item._id, data.newPrice);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // 📡 UPDATE (Part 2): Send New Price to Server
  sendUpdatedPrice(id: string, newPrice: any) {
    this.loading = true;
    this.http.put(`${this.apiUrl}/${id}`, { price: newPrice }).subscribe({
      next: () => {
        this.showToast('Price updated!');
        this.loadInventory();
      },
      error: () => {
        this.showToast('Failed to update price.');
        this.loading = false;
      }
    });
  }

  // 🍞 Helper function to show popup messages
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  // Helps Angular render the list efficiently
  trackByIndex(index: number, item: any) {
    return item._id;
  }
}