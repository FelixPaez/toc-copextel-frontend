import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CouriersService } from '../../orders/couriers.service';
import { Courier, DestinationState, DestinationCity } from '../../orders/couriers.types';
import { AuthService } from '../../../core/services/auth.service';
import { LocationService } from '../../../core/services/location.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-courier-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './courier-detail.component.html',
  styleUrls: ['./courier-detail.component.scss']
})
export class CourierDetailComponent implements OnInit, OnDestroy {
  courierForm: FormGroup;
  dynamicStatesForm: FormGroup;
  globalCostForm: FormGroup;
  allCitiesControl: FormControl = new FormControl(true);

  isEditMode = false;
  courierId: string | null = null;
  isLoading = false;
  isSaving = false;
  isSavingDestinations = false;

  states: string[] = [];
  cities: string[] = [];
  selectedDeliveryState: string | null = null;
  flashMessage: 'success' | 'updated' | 'error' | null = null;

  // Expansion panels
  generalInfoExpanded = true;
  destinationsExpanded = false;

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private couriersService: CouriersService,
    private locationService: LocationService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private snackBar: MatSnackBar
  ) {
    this.courierForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      contact: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      obs: [''],
      active: [true],
      destinations: this.fb.array([])
    });

    this.dynamicStatesForm = this.fb.group({
      name: [null],
      cities: this.fb.array([])
    });

    this.globalCostForm = this.fb.group({
      costCup: [0, [Validators.min(0)]],
      costMlc: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Load states
    this.locationService.states$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(states => {
        this.states = states;
      });

    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.courierId = params['id'];
        this.isEditMode = this.courierId !== 'new';

        if (this.isEditMode && this.courierId) {
          this.loadCourier();
        }
      });

    // Watch state changes to load cities
    this.courierForm.get('state')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(state => {
        if (state) {
          this._getCitiesByState(state);
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadCourier(): void {
    if (!this.courierId) return;

    this.isLoading = true;
    this.couriersService.getCourierById(this.courierId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (courier) => {
          this.courierForm.patchValue({
            ...courier,
            destinations: [] // Will be handled separately
          });

          // Load destinations if they exist
          if (courier.destinations && courier.destinations.length > 0) {
            const destinationsArray = this.courierForm.get('destinations') as FormArray;
            destinationsArray.clear();

            courier.destinations.forEach(destination => {
              const stateFormGroup = this.fb.group({
                name: [destination.name],
                cities: this.fb.array([])
              });

              const citiesArray = stateFormGroup.get('cities') as FormArray;
              destination.cities.forEach(city => {
                citiesArray.push(this.fb.group({
                  name: [city.name],
                  costCup: [city.costCup, [Validators.min(0)]],
                  costMlc: [city.costMlc, [Validators.min(0)]]
                }));
              });

              destinationsArray.push(stateFormGroup);
            });

            // Select first destination if exists
            if (courier.destinations.length > 0) {
              this.goToStatePanel(courier.destinations[0].name);
            }
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error al cargar el transportista';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  onSubmit(): void {
    if (this.courierForm.invalid) {
      return;
    }

    this.confirmService.confirm({
      title: this.isEditMode ? 'Actualizar Transportista' : 'Crear Transportista',
      message: '¿Está seguro que toda la información es correcta?',
      icon: 'help_outline',
      type: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isSaving = true;
        const courierData: Courier = {
          ...this.courierForm.getRawValue(),
          vendorId: this.authService.getCurrentUser()?.vendorId || ''
        };

        if (this.isEditMode && this.courierId) {
          courierData.id = this.courierId;
          this.couriersService.updateCourier(courierData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.snackBar.open('Transportista actualizado exitosamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.router.navigate(['../'], { relativeTo: this.route });
              },
              error: (error) => {
                this.isSaving = false;
                const errorMessage = error?.error?.message || error?.message || 'Error al actualizar el transportista';
                this.snackBar.open(errorMessage, 'Cerrar', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        } else {
          this.couriersService.createCourier(courierData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.snackBar.open('Transportista creado exitosamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.router.navigate(['../'], { relativeTo: this.route });
              },
              error: (error) => {
                this.isSaving = false;
                const errorMessage = error?.error?.message || error?.message || 'Error al crear el transportista';
                this.snackBar.open(errorMessage, 'Cerrar', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  goToStatePanel(state: string): void {
    if (this.selectedDeliveryState === state) {
      return;
    }

    this.selectedDeliveryState = state;
    this._getCitiesByState(state);

    // Check if state already exists in destinations
    const destinations = this.courierForm.get('destinations') as FormArray;
    const existingIndex = destinations.controls.findIndex(
      control => control.get('name')?.value === state
    );

    if (existingIndex > -1) {
      // Load existing destination
      const existingState = destinations.at(existingIndex);
      this.dynamicStatesForm = this.fb.group({
        name: [state],
        cities: this.fb.array([])
      });

      const citiesArray = existingState.get('cities') as FormArray;
      const dynamicCitiesArray = this.dynamicStatesForm.get('cities') as FormArray;
      dynamicCitiesArray.clear();

      citiesArray.controls.forEach(cityControl => {
        dynamicCitiesArray.push(this.fb.group({
          name: [cityControl.get('name')?.value],
          costCup: [cityControl.get('costCup')?.value, [Validators.min(0)]],
          costMlc: [cityControl.get('costMlc')?.value, [Validators.min(0)]]
        }));
      });
    } else {
      // Create new destination with all cities
      this.dynamicStatesForm = this.fb.group({
        name: [state],
        cities: this.fb.array([])
      });

      const citiesArray = this.dynamicStatesForm.get('cities') as FormArray;
      this.cities.forEach(city => {
        citiesArray.push(this.fb.group({
          name: [city],
          costCup: [0, [Validators.min(0)]],
          costMlc: [0, [Validators.min(0)]]
        }));
      });
    }
  }

  saveCitiesCosts(): void {
    if (!this.selectedDeliveryState) return;

    const selectedState = this.dynamicStatesForm.getRawValue();
    const courier = this.courierForm.getRawValue();
    
    if (!courier.destinations) {
      courier.destinations = [];
    }

    const index = courier.destinations.findIndex(
      (d: DestinationState) => d.name === selectedState.name
    );

    if (index > -1) {
      courier.destinations[index] = selectedState;
    } else {
      courier.destinations.push(selectedState);
    }

    // Update destinations in form
    const destinationsArray = this.courierForm.get('destinations') as FormArray;
    destinationsArray.clear();
    
    courier.destinations.forEach((destination: DestinationState) => {
      const stateFormGroup = this.fb.group({
        name: [destination.name],
        cities: this.fb.array([])
      });

      const citiesArray = stateFormGroup.get('cities') as FormArray;
      destination.cities.forEach(city => {
        citiesArray.push(this.fb.group({
          name: [city.name],
          costCup: [city.costCup, [Validators.min(0)]],
          costMlc: [city.costMlc, [Validators.min(0)]]
        }));
      });

      destinationsArray.push(stateFormGroup);
    });

    // Update courier
    this.isSavingDestinations = true;
    const courierData: Courier = {
      ...this.courierForm.getRawValue(),
      id: this.courierId || undefined,
      vendorId: this.authService.getCurrentUser()?.vendorId || ''
    };

    this.couriersService.updateCourier(courierData)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this.isSavingDestinations = false;
          this._showFlashMessage('updated');
          this.snackBar.open('Costos de destinos guardados correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isSavingDestinations = false;
          this._showFlashMessage('error');
          const errorMessage = error?.error?.message || error?.message || 'Error al guardar los costos';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  clearCitiesCosts(): void {
    if (!this.selectedDeliveryState) return;

    this.confirmService.confirm({
      title: 'Eliminar Costos',
      message: `¿Está seguro que desea eliminar los costos de envío para ${this.selectedDeliveryState}?`,
      icon: 'warning_amber',
      type: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        const courier = this.courierForm.getRawValue();
        
        if (courier.destinations) {
          const index = courier.destinations.findIndex(
            (d: DestinationState) => d.name === this.selectedDeliveryState
          );

          if (index > -1) {
            courier.destinations.splice(index, 1);

            // Update destinations in form
            const destinationsArray = this.courierForm.get('destinations') as FormArray;
            destinationsArray.clear();
            
            courier.destinations.forEach((destination: DestinationState) => {
              const stateFormGroup = this.fb.group({
                name: [destination.name],
                cities: this.fb.array([])
              });

              const citiesArray = stateFormGroup.get('cities') as FormArray;
              destination.cities.forEach(city => {
                citiesArray.push(this.fb.group({
                  name: [city.name],
                  costCup: [city.costCup, [Validators.min(0)]],
                  costMlc: [city.costMlc, [Validators.min(0)]]
                }));
              });

              destinationsArray.push(stateFormGroup);
            });

            // Update courier
            this.isSavingDestinations = true;
            const courierData: Courier = {
              ...this.courierForm.getRawValue(),
              id: this.courierId || undefined,
              vendorId: this.authService.getCurrentUser()?.vendorId || ''
            };

            this.couriersService.updateCourier(courierData)
              .pipe(takeUntil(this._unsubscribeAll))
              .subscribe({
                next: () => {
                  this.isSavingDestinations = false;
                  this.selectedDeliveryState = null;
                  this.dynamicStatesForm.reset();
                  this.snackBar.open('Costos eliminados correctamente', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                  });
                },
                error: (error) => {
                  this.isSavingDestinations = false;
                  const errorMessage = error?.error?.message || error?.message || 'Error al eliminar los costos';
                  this.snackBar.open(errorMessage, 'Cerrar', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                  });
                }
              });
          }
        }
      }
    });
  }

  setCostCup(): void {
    const costCup = this.globalCostForm.get('costCup')?.value || 0;
    const citiesArray = this.dynamicStatesForm.get('cities') as FormArray;
    
    citiesArray.controls.forEach(control => {
      control.patchValue({ costCup });
    });
  }

  setCostMlc(): void {
    const costMlc = this.globalCostForm.get('costMlc')?.value || 0;
    const citiesArray = this.dynamicStatesForm.get('cities') as FormArray;
    
    citiesArray.controls.forEach(control => {
      control.patchValue({ costMlc });
    });
  }

  get citiesFormArray(): FormArray {
    return this.dynamicStatesForm.get('cities') as FormArray;
  }

  private _getCitiesByState(state: string): void {
    this.locationService.getCitiesByState(state)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(cities => {
        this.cities = cities;
      });
  }

  private _showFlashMessage(type: 'success' | 'updated' | 'error'): void {
    this.flashMessage = type;
    setTimeout(() => {
      this.flashMessage = null;
    }, 3000);
  }
}
