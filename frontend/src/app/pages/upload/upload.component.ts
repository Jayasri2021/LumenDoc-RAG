import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RagApiService } from '../../services/rag-api.service';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {
  selectedFile?: File;
  url = '';
  loading = false;

  constructor(private api: RagApiService, private router: Router) { }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) return;

    this.loading = true;
    this.api.uploadPdf(this.selectedFile).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/query', res.document_id]);
      },
      error: () => (this.loading = false)
    });
  }
}
