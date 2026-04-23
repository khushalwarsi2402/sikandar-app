import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { ToastController, AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonBadge, IonSpinner, IonButtons, IonSearchbar, IonGrid, IonRow, IonCol, 
  IonFooter, IonTabs, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  trashOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, addCircleOutline, cartOutline, home, gridOutline, personOutline 
} from 'ionicons/icons';
// Import the Cart Service you created
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
    IonFooter, IonTabs, IonTabBar, IonTabButton, IonRefresher, IonRefresherContent
  ]
})
export class HomePage implements OnInit {
  inventory: any[] = [];
  fullInventory: any[] = []; 
  isAdmin = false; 
  loading = false;
  cartCount = 0; // Local variable for the red badge

  // Added imageUrl here so you can save images to MongoDB
  newItem = { name: '', price: null as number | null, imageUrl: '' }; 

  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController, 
    private http: HttpClient,
    private cartService: CartService // Inject the Cart Service
  ) {
    addIcons({trashOutline, home, gridOutline, cartOutline, personOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, syncOutline, addCircleOutline});
    
    // Subscribe to cart changes so the badge updates instantly
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  ngOnInit() {
    this.loadInventory();
  }

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
              this.showToast('Unlocked!');
              return true;
            } else {
              this.showToast('Wrong PIN!');
              return false; 
            }
          }
        }
      ]
    });
    await alert.present();
  }

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
        this.showToast('Server is sleeping. Try refreshing!');
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.trim() !== '') {
      this.inventory = this.fullInventory.filter(item => item.name.toLowerCase().indexOf(query) > -1);
    } else {
      this.inventory = [...this.fullInventory];
    }
  }

  // The function that makes your "Add" button work!
  addToCart(item: any) {
    this.cartService.addToCart(item);
    this.showToast(`${item.name} added to cart!`);
  }

  saveItem() {
    if (!this.newItem.name || !this.newItem.price) return;
    this.http.post(this.apiUrl, this.newItem).subscribe({
      next: () => {
        this.newItem = { name: '', price: null, imageUrl: '' }; // Reset fields
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