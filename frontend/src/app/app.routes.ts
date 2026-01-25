import { Routes } from '@angular/router';
import { UploadComponent } from './pages/upload/upload.component';
import { QueryComponent } from './pages/query/query.component';
import { ResultsComponent } from './pages/results/results.component';

export const routes: Routes = [
    { path: '', redirectTo: 'upload', pathMatch: 'full' },
    { path: 'upload', component: UploadComponent },
    { path: 'query/:documentId', component: QueryComponent },
    { path: 'results', component: ResultsComponent }
];
