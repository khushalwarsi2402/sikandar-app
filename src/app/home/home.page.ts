import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
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
})
export class HomePage implements OnInit {
  
  // --- APP MEMORY VARIABLES ---
  inventory: any[] = [];
  isAdmin = false; 
  cart: any[] = []; 
  isCartModalOpen = false;
  loading = false;
  
  // Storage for the HTML form inputs
  newItem = { name: '', price: null as number | null }; 

  // Production Database URL
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    // Registering all the required Ionic icons
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

  // Flips the Admin mode on and off
  toggleAdmin() {
    this.isAdmin = !this.isAdmin;
  }

  // Fetch data from MongoDB
  loadInventory() {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching inventory:', err);
        this.showToast('Failed to load inventory. Is the server awake?');
        this.loading = false;
      }
    });
  }

  // Save new item to MongoDB
  saveItem() {
    if (!this.newItem.name || !this.newItem.price) {
      this.showToast('Please enter both name and price!');
      return;
    }

    this.http.post(this.apiUrl, this.newItem).subscribe({
      next: () => {
        this.showToast('Item saved successfully!');
        this.newItem = { name: '', price: null }; // Clear the form
        this.loadInventory(); // Refresh the list
      },
      error: (err) => {
        console.error('Error saving item:', err);
        this.showToast('Failed to save item.');
      }
    });
  }

  // Delete an item
  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.showToast('Item deleted!');
        this.loadInventory();
      },
      error: (err) => {
        console.error('Error deleting item:', err);
        this.showToast('Failed to delete item.');
      }
    });
  }

  // Helper function for quick notifications
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}