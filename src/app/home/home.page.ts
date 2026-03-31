import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  lockClosedOutline, 
  lockOpenOutline, 
  cloudUploadOutline, 
  syncOutline, 
  trashOutline, 
  cartOutline, 
  cart 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  
  // --- YOUR APP's MEMORY VARIABLES ---
  inventory: any[] = [];
  isAdmin = false; 
  cart: any[] = []; 
  isCartModalOpen = false;
  loading = false;
  
  // We need this so your HTML form [(ngModel)] has somewhere to store the typed text!
  newItem = { name: '', price: null as number | null }; 

  // Production Database URL
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    // Icons properly registered here!
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

  // 🛒 CUSTOMER: Add item to virtual cart
  addToCart(item: any) {
    this.cart.push(item);
    this.showToast(`${item.name} added to your cart! 🛒`);
  }

  // 🧮 CUSTOMER: Calculate total price of cart
  get cartTotal() {
    return this.cart.reduce((total, item) => total + item.price, 0);
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
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
      },
      error: () => {
        this.showToast('Failed to load inventory from MongoDB.');
        this.loading = false;
      }
    });
  }

  // ➕ CREATE: Send New Item to Server
  addItem() {
    // Check if the form is empty before saving
    if (!this.newItem.name || !this.newItem.price) {
      this.showToast('Please enter both name and price');
      return;
    }
    
    this.loading = true;
    this.http.post(this.apiUrl, { 
      name: this.newItem.name, 
      price: Number(this.newItem.price) 
    }).subscribe({
      next: () => {
        this.showToast('Item added to MongoDB!');
        this.newItem = { name: '', price: null }; // This successfully clears the input boxes!
        this.loadInventory();
      },
      error: () => {
        this.showToast('Failed to save item.');
        this.loading = false;
      }
    });
  }

  // 🗑️ DELETE: Tell Server to Remove Item
  deleteItem(id: string) {
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
              this.sendUpdatedPrice(item._id, Number(data.newPrice));
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // 📡 UPDATE (Part 2): Send New Price to Server
  sendUpdatedPrice(id: string, newPrice: number) {
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