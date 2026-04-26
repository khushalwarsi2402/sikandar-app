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
  IonList, IonThumbnail, IonAvatar, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  trashOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, addCircleOutline, cartOutline, home, gridOutline, personOutline,
  locationOutline, receiptOutline, settingsOutline, logoWhatsapp, paperPlaneOutline
} from 'ionicons/icons';

// --- GEOLOCATION IMPORT ---
import { Geolocation } from '@capacitor/geolocation';
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
    IonList, IonThumbnail, IonAvatar, IonSelect, IonSelectOption
  ]
})
export class HomePage implements OnInit {
  
  currentView: string = 'home'; 
  loading = false;
  isAdmin = false;

  inventory: any[] = [];
  fullInventory: any[] = []; 
  cartItems: any[] = [];
  
  cartCount = 0;
  cartTotal = 0;
  searchTimeout: any; 
  selectedArea: string = "";
  
  // Coordinates for logistics
  userCoords: { lat: number, lng: number } | null = null;

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
      addCircleOutline, locationOutline, receiptOutline, settingsOutline,
      logoWhatsapp, paperPlaneOutline
    });
    
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  // --- NAVIGATION ---
  setView(view: string) {
    this.currentView = view;
    if (view === 'cart') {
      this.cartItems = this.cartService.getCart();
      this.calculateTotal();
    }
  }

  // --- GEOLOCATION ENGINE (WITH FAIL-SAFE TIMEOUT) ---
  async getLocation() {
    try {
      // Race condition: Wait max 4 seconds for GPS, otherwise move on to WhatsApp
      const locationPromise = Geolocation.getCurrentPosition();
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
      
      const position: any = await Promise.race([locationPromise, timeoutPromise]);
      
      if (position && position.coords) {
        this.userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        return this.userCoords;
      }
      return null;
    } catch (e) {
      console.warn('Geolocation failed or denied', e);
      return null;
    }
  }

  // --- INTEGRATED ORDER LOGIC ---
  async placeOrder() {
    if (this.cartItems.length === 0) {
      this.showToast("Add some items first!");
      return;
    }

    this.showToast("Preparing order..."); 
    
    this.loading = true; 
    const coords = await this.getLocation();
    this.loading = false;

    // 1. Build Message Header
    let message = `*🥩 NEW ORDER - BISMILLAH MEATS* \n`;
    message += `Area: ${this.selectedArea || 'Local Delivery'}\n`;
    
    // 2. Add Location Link (Fixed Google Maps URL)
    if (coords) {
      message += `📍 Location: https://maps.google.com/?q=${coords.lat},${coords.lng}\n`;
    } else {
      message += `📍 Location: (Not Provided)\n`;
    }

    message += `--------------------------\n`;
    
    // 3. Add Items
    this.cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - ₹${item.price}\n`;
    });

    message += `--------------------------\n`;
    message += `*Total Amount: ₹${this.cartTotal}*\n\n`;
    message += `_Customer: Khushal Warsi_`;

    // 4. Send to WhatsApp (THE BYPASS FIX)
    const shopNumber = "91XXXXXXXXXX"; // ⚠️ REPLACE WITH YOUR REAL 10-DIGIT NUMBER
    const whatsappUrl = `https://wa.me/${shopNumber}?text=${encodeURIComponent(message)}`;
    
    // Instead of window.open, this forces the current tab to redirect, bypassing pop-up blockers!
    window.location.href = whatsappUrl; 

    // 5. Save to MongoDB for Admin Tracking
    this.saveOrderRecord(coords);
  }

  private saveOrderRecord(coords: any) {
    const orderData = {
      items: this.cartItems,
      total: this.cartTotal,
      location: coords,
      area: this.selectedArea,
      status: 'Received',
      timestamp: new Date()
    };
    // Send to your backend orders collection
    this.http.post('https://sikandar-app.onrender.com/api/orders', orderData).subscribe();
  }

  // --- CART & SEARCH CORE ---
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.inventory = query.trim() !== '' 
        ? this.fullInventory.filter(item => item.name.toLowerCase().includes(query))
        : [...this.fullInventory];
    }, 400); 
  }

  addToCart(item: any) {
    this.cartService.addToCart(item);
    this.showToast('Added to basket');
  }

  removeFromCart(index: number) {
    this.cartService.removeFromCart(index);
    this.cartItems = this.cartService.getCart();
    this.calculateTotal();
  }

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce((acc, item) => acc + item.price, 0);
  }

  // --- API OPERATIONS ---
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
        this.showToast('Inventory Updated');
      }
    });
  }

  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadInventory()
    });
  }

  // --- UTILS ---
  async toggleAdmin() {
    if (this.isAdmin) {
      this.isAdmin = false;
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Admin PIN',
      inputs: [{ name: 'pin', type: 'password', placeholder: '****' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Unlock',
          handler: (data) => {
            if (data.pin === '2404') {
              this.isAdmin = true;
              this.showToast('Admin Mode Active');
              return true;
            }
            this.showToast('Invalid PIN');
            return false;
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