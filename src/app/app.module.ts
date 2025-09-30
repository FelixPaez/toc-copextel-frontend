import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Plantilla original comentada
// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';
// import { SharedModule } from './shared/shared.module';
// import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';
// import { HttpClientModule } from '@angular/common/http';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Nuevo módulo admin
import { AppRoutingModule } from './app-routing-new.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

// Core Module del admin
import { CoreModule } from './admin/core/core.module';

// Shared Module del admin
import { SharedModule } from './shared/shared.module';

// Material Providers
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // SharedModule, // Comentado - plantilla original
    HttpClientModule,
    BrowserAnimationsModule,
    // InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }), // Comentado - plantilla original
    AppRoutingModule,
    // NgbModule, // Comentado - plantilla original
    
    // Módulos del admin
    CoreModule,
    SharedModule
  ],
  providers: [
    // Material Configuration
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
