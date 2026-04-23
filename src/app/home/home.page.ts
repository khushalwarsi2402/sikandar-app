import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { ToastController, AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonBadge, IonSpinner, IonButtons, IonSearchbar, IonGrid, IonRow, IonCol, 
  IonFooter, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent,
  IonList, IonThumbnail, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  trashOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, addCircleOutline, cartOutline, home, gridOutline, personOutline,
  locationOutline, receiptOutline, settingsOutline
} from 'ionicons/icons';

import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
    IonIcon, IonBadge, IonSpinner, IonButtons, IonSearchbar, IonGrid, IonRow, IonCol, 
    IonFooter, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent,
    IonList, IonThumbnail, IonAvatar
  ]
})
export class HomePage implements OnInit {
  
  // State Management
  currentView: string = 'home'; 
  loading = false;
  isAdmin = false;

  // Data Arrays
  inventory: any[] = [];
  fullInventory: any[] = []; 
  cartItems: any[] = [];
  
  // Totals & Search
  cartCount = 0;
  cartTotal = 0;
  searchTimeout: any; 

  newItem = { name: '', price: null as number | null, imageUrl: '' }; 
  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController, 
    private http: HttpClient,
    private cartService: CartService 
  ) {
    addIcons({
      trashOutline, home, gridOutline, cartOutline, personOutline, 
      lockClosedOutline, lockOpenOutline, cloudUploadOutline, syncOutline, 
      addCircleOutline, locationOutline, receiptOutline, settingsOutline
    });
    
    // Auto-update the badge when the service changes
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  // --- NAVIGATION LOGIC ---
  setView(view: string) {
    this.currentView = view;
    if (view === 'cart') {
      this.cartItems = this.cartService.getCart();
      this.calculateTotal();
    }
  }

  // --- SEARCH LOGIC (Optimized with 400ms Debounce) ---
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      if (query && query.trim() !== '') {
        this.inventory = this.fullInventory.filter(item => 
          item.name.toLowerCase().includes(query)
        );
      } else {
        this.inventory = [...this.fullInventory];
      }
    }, 400); 
  }

  // --- CART LOGIC ---
  addToCart(item: any) {
    this.cartService.addToCart(item);
    this.showToast(`${item.name} added to cart!`);
  }

  removeFromCart(index: number) {
    if (index < 0 || index >= this.cartItems.length) return;
    this.cartItems.splice(index, 1);
    this.calculateTotal();
    this.cartCount = this.cartItems.length;
    this.showToast('Item removed from basket');
  }

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce((acc, item) => acc + item.price, 0);
  }

  // --- API / BACKEND LOGIC ---
  loadInventory(event?: any) {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.fullInventory = data; 
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.showToast('Connecting to server...');
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.price) return;
    this.http.post(this.apiUrl, this.newItem).subscribe({
      next: () => {
        this.newItem = { name: '', price: null, imageUrl: '' };
        this.loadInventory();
        this.showToast('Item successfully listed!');
      }
    });
  }

  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadInventory()
    });
  }

  // --- ADMIN & UI UTILS ---
  async toggleAdmin() {
    if (this.isAdmin) {
      this.isAdmin = false;
      this.showToast('Inventory Locked');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Admin Access',
      backdropDismiss: false, 
      inputs: [{ name: 'pin', type: 'password', placeholder: '****', attributes: { inputmode: 'numeric', maxlength: 4 } }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Unlock',
          handler: (data: any) => {
            if (data.pin === '2404') {
              this.isAdmin = true;
              this.showToast('Welcome, Admin');
              return true;
            } else {
              this.showToast('Access Denied');
              return false; 
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, position: 'top' });
    toast.present();
  }
}