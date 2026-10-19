import { Component, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-mamage-cities',
  templateUrl: './mamage-cities.component.html',
  styleUrls: ['./mamage-cities.component.scss'],
})
export class MamageCitiesComponent implements OnDestroy {
  cityForm: FormGroup;
  collection = 'cities';
  cities: any = [];
  loading = true;
  search = '';
  checkDeletePermision:any='false';
  private citiesSub?: Subscription;
  constructor(
    public db: AngularFirestore,
    public fb: FormBuilder,
    public toastService: MessageService,
    public confirmationService:ConfirmationService
  ) {
    this.cityForm = this.fb.group({ name: ['', [Validators.required]] });
    this.setAllCities();
    this.checkDeletePermision=localStorage.getItem('isAdminReadonly')||'false'
  }
  save() {
    const name = (this.cityForm.value.name || '').trim();
    if (!name) {
      return;
    }
    this.db.collection(this.collection).add({ ...this.cityForm.value, name });
    this.cityForm.reset();
  }
  setAllCities() {
    this.citiesSub = this.db
      .collection('cities')
      .snapshotChanges()
      .pipe(
        map((actions: any) =>
          actions.map((a: any) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((res: any) => {
        this.cities = res;
        this.loading = false;
      });
  }

  get filteredCities() {
    const term = this.search.trim().toLowerCase();
    return term ? this.cities.filter((city: any) => (city.name || '').toLowerCase().includes(term)) : this.cities;
  }

  ngOnDestroy() {
    this.citiesSub?.unsubscribe();
  }

  async deleteCity(id: string) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to perform this action?',
      accept: async () => {
        let promise: any = await this.db
          .collection('employees', (ref) => ref.where('city', '==', id))
          .get()
          .toPromise();
        if (promise?.docs.length == 0) {
          this.db.collection(this.collection).doc(id).delete();
        } else {
          this.toastService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Data Exist for this city',
          });
        }
      },
    });
  }
}
