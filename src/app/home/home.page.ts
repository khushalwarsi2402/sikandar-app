import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { ToastController, AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonBadge, IonSpinner, IonButtons, IonSearchbar, IonGrid, IonRow, IonCol, 
  IonFooter, IonTabs, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent,
  IonList, IonThumbnail, IonAvatar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  trashOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, addCircleOutline, cartOutline, home, gridOutline, personOutline,
  locationOutline, receiptOutline, settingsOutline
} from 'ionicons/icons';

// Import the Service that manages the shopping cart
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
    IonFooter, IonTabs, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent,
    IonList, IonThumbnail, IonAvatar
  ]
})
export class HomePage implements OnInit {
  
  // --- View State Control ---
  currentView: string = 'home'; // Tracks 'home', 'cart', or 'profile'

  // --- Inventory & Search Logic ---
  inventory: any[] = [];
  fullInventory: any[] = []; 
  loading = false;
  searchTimeout: any; // Used for search debouncing

  // --- Cart State ---
  cartItems: any[] = [];
  cartTotal: number = 0;
  cartCount = 0;

  // --- Admin State ---
  isAdmin = false; 
  newItem = { name: '', price: null as number | null, imageUrl: '' }; 

  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController, 
    private http: HttpClient,
    private cartService: CartService 
  ) {
    // Register all icons used in the app
    addIcons({
      trashOutline, home, gridOutline, cartOutline, personOutline, 
      lockClosedOutline, lockOpenOutline, cloudUploadOutline, syncOutline, 
      addCircleOutline, locationOutline, receiptOutline, settingsOutline
    });
    
    // Watch the cart service for real-time badge updates
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

  // --- 1. VIEW NAVIGATION ---
  setView(view: string) {
    this.currentView = view;
    if (view === 'cart') {
      this.cartItems = this.cartService.getCart();
      this.calculateTotal();
    }
  }

  // --- 2. SEARCH WITH DEBOUNCING (Optimization) ---
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    
    // Clear previous timer to reset the 400ms wait
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      if (query && query.trim() !== '') {
        this.inventory = this.fullInventory.filter(item => 
          item.name.toLowerCase().includes(query)
        );
      } else {
        this.inventory = [...this.fullInventory]; // Reset if empty
      }
    }, 400); 
  }

  // --- 3. CART ACTIONS ---
  addToCart(item: any) {
    this.cartService.addToCart(item);
    this.showToast(`${item.name} added to cart!`);
  }

  calculateTotal() {
    this.cartTotal = this.cartItems.reduce((acc, item) => acc + item.price, 0);
  }

  // --- 4. BACKEND INTEGRATION (API) ---
  loadInventory(event?: any) {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.fullInventory = data; 
        this.loading = false;
        if (event) event.target.complete(); // Stop the refresher spinner
      },
      error: () => {
        this.showToast('Server is sleeping. Try refreshing!');
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.price) return;
    this.http.post(this.apiUrl, this.newItem).subscribe({
      next: () => {
        this.newItem = { name: '', price: null, imageUrl: '' }; // Reset
        this.loadInventory();
        this.showToast('Item Added Successfully!');
      }
    });
  }

  deleteItem(id: string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.loadInventory();
        this.showToast('Item Deleted');
      }
    });
  }

  // --- 5. UTILITIES ---
  async toggleAdmin() {
    if (this.isAdmin) {
      this.isAdmin = false;
      this.showToast('Admin Mode Locked');
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
              this.showToast('Welcome, Khushal!');
              return true;
            } else {
              this.showToast('Incorrect PIN!');
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