import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { ToastController, AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
  IonIcon, IonList, IonListHeader, IonAvatar, IonBadge, IonSpinner, IonButtons,
  // --- THESE ARE THE NEW IMPORTS YOU WERE MISSING ---
  IonSearchbar, IonGrid, IonRow, IonCol, IonFooter, IonTabs, IonTabBar, IonTabButton,
  IonRefresher, IonRefresherContent 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons'; 
import { 
  trashOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, 
  syncOutline, addCircleOutline, cartOutline, home, gridOutline, personOutline 
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
    IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, 
    IonIcon, IonList, IonListHeader, IonAvatar, IonBadge, IonSpinner, IonButtons,
    // --- THEY MUST ALSO BE REGISTERED HERE ---
    IonSearchbar, IonGrid, IonRow, IonCol, IonFooter, IonTabs, IonTabBar, IonTabButton,
    IonRefresher, IonRefresherContent
  ]
})
export class HomePage implements OnInit {
  inventory: any[] = [];
  fullInventory: any[] = []; // Used to help the search bar work
  isAdmin = false; 
  loading = false;
  newItem = { name: '', price: null as number | null }; 

  private apiUrl = 'https://sikandar-app.onrender.com/api/inventory';

  constructor(private alertCtrl: AlertController, private toastCtrl: ToastController, private http: HttpClient) {
    addIcons({trashOutline, home, gridOutline, cartOutline, personOutline, lockClosedOutline, lockOpenOutline, cloudUploadOutline, syncOutline, addCircleOutline});
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

    try {
      const alert = await this.alertCtrl.create({
        header: 'Admin Access',
        backdropDismiss: false, 
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
    } catch (error) {
      console.error("Alert failed to open:", error);
    }
  }

  // Updated to handle the Pull-to-Refresh gesture
  loadInventory(event?: any) {
    this.loading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.inventory = data;
        this.fullInventory = data; // Save a copy for searching
        this.loading = false;
        if (event) event.target.complete(); // Stop the refresh spinner
      },
      error: () => {
        this.showToast('Server is sleeping. Try refreshing!');
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  // New function for the Search Bar!
  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.trim() !== '') {
      this.inventory = this.fullInventory.filter((item) => {
        return item.name.toLowerCase().indexOf(query) > -1;
      });
    } else {
      this.inventory = [...this.fullInventory]; // Reset if search is empty
    }
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