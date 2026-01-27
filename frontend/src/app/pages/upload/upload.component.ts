import { Component } from '@angular/core';
import { RagApiService } from '../../services/rag-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  sourceType: 'file' | 'url' = 'file';
  selectedFile?: File;
  url = '';
  documentId = '';
  uploadMessage = '';
  uploading = false;
  sending = false;
  question = '';
  dragging = false;
  messages: ChatMessage[] = [];
  pdfPreviewUrl: SafeResourceUrl | null = null;
  private previewObjectUrl?: string;

  constructor(private api: RagApiService, private sanitizer: DomSanitizer) {}

  get documentPreviewLabel() {
    if (this.selectedFile) {
      return this.selectedFile.name;
    }
    if (this.url) {
      return this.url;
    }
    return 'No document selected yet.';
  }

  onSourceTypeChange(value: 'file' | 'url') {
    this.sourceType = value;
    if (value === 'file') {
      this.url = '';
    } else {
      this.selectedFile = undefined;
      this.releasePreview();
    }
    this.resetConversation();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  onUrlChange(value: string) {
    this.url = value;
    if (value) {
      this.sourceType = 'url';
      this.selectedFile = undefined;
      this.releasePreview();
      this.resetConversation();
    }
  }

  clearSource() {
    this.selectedFile = undefined;
    this.url = '';
    this.documentId = '';
    this.uploadMessage = '';
    this.messages = [];
    this.dragging = false;
    this.releasePreview();
  }

  uploadSource() {
    if (this.sourceType === 'file' && !this.selectedFile) return;
    if (this.sourceType === 'url' && !this.url) return;

    this.uploading = true;
    const request$ =
      this.sourceType === 'file'
        ? this.api.uploadPdf(this.selectedFile as File)
        : this.api.ingestUrl(this.url);

    request$
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: (res: { document_id: string }) => {
          this.documentId = res.document_id;
          this.uploadMessage = 'Document ready to chat.';
        },
        error: (err) => {
          const detail = err?.error?.detail || err?.message || 'Upload failed. Please try again.';
          this.uploadMessage = detail;
        }
      });
  }

  sendQuestion() {
    const trimmed = this.question.trim();
    if (!trimmed || !this.documentId) return;

    this.messages.push({ role: 'user', text: trimmed });
    this.question = '';
    this.sending = true;
    this.api.query(this.documentId, trimmed).subscribe({
      next: (res: { answer: string }) => {
        this.messages.push({ role: 'assistant', text: res.answer });
        this.sending = false;
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          text: 'Sorry, I could not get an answer. Please try again.'
        });
        this.sending = false;
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.sourceType = 'file';
      this.processDroppedFile(file);
    }
  }

  private handleFileSelection(file: File) {
    this.selectedFile = file;
    this.createPdfPreview(file);
    this.sourceType = 'file';
    this.url = '';
    this.resetConversation();
  }

  private processDroppedFile(file: File) {
    this.selectedFile = file;
    this.createPdfPreview(file);
    this.url = '';
    this.resetConversation();
  }

  private createPdfPreview(file: File) {
    this.releasePreview();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewObjectUrl);
  }

  private releasePreview() {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = undefined;
    }
    this.pdfPreviewUrl = null;
  }

  private resetConversation() {
    this.documentId = '';
    this.uploadMessage = '';
    this.messages = [];
    this.question = '';
    this.sending = false;
  }
}
