import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { RagApiService } from '../../services/rag-api.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize, timeout } from 'rxjs/operators';

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

  constructor(
    private api: RagApiService,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

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
    if (this.sourceType === 'url') {
      const normalized = this.normalizeUrl(this.url);
      if (!normalized) {
        this.uploadMessage = 'Please enter a valid URL (including domain).';
        return;
      }
      this.url = normalized;
    }

    this.uploading = true;
    const request$ =
      this.sourceType === 'file'
        ? this.api.uploadPdf(this.selectedFile as File)
        : this.api.ingestUrl(this.url);

    request$
      .pipe(
        timeout(60000),
        finalize(() => this.updateUi(() => (this.uploading = false)))
      )
      .subscribe({
        next: (res: { document_id?: string; documentId?: string } | string | unknown) => {
          const response = res as { document_id?: string; documentId?: string; data?: { document_id?: string } };
          const docId =
            response?.document_id ||
            response?.documentId ||
            response?.data?.document_id ||
            (typeof res === 'string' ? res : '') ||
            '';
          this.updateUi(() => {
            if (!docId) {
              this.documentId = '';
              this.uploadMessage = 'Upload succeeded but no document id was returned.';
              return;
            }
            this.documentId = docId;
            this.uploadMessage = `Document ready to chat. ID: ${docId}`;
            this.messages = [];
          });
        },
        error: (err) => {
          const detail =
            err?.error?.detail ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            (err?.name === 'TimeoutError' ? 'Upload timed out. Please try again.' : '') ||
            `Upload failed (status ${err?.status ?? 'unknown'}).`;
          this.updateUi(() => {
            this.uploadMessage = detail;
            this.documentId = '';
          });
        }
      });
  }

  sendQuestion() {
    const trimmed = this.question.trim();
    if (!trimmed || !this.documentId) return;

    this.updateUi(() => {
      this.messages.push({ role: 'user', text: trimmed });
      this.question = '';
      this.sending = true;
    });
    this.api.query(this.documentId, trimmed).pipe(timeout(60000)).subscribe({
      next: (res: { answer: string }) => {
        this.updateUi(() => {
          this.messages.push({ role: 'assistant', text: res.answer });
          this.sending = false;
        });
      },
      error: (err) => {
        const detail =
          err?.error?.detail ||
          err?.message ||
          (err?.name === 'TimeoutError' ? 'Query timed out. Please try again.' : '') ||
          'Sorry, I could not get an answer. Please try again.';
        this.updateUi(() => {
          this.messages.push({
            role: 'assistant',
            text: detail
          });
          this.sending = false;
        });
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

  private updateUi(update: () => void) {
    this.zone.run(() => {
      update();
      this.cdr.detectChanges();
    });
  }

  private normalizeUrl(rawUrl: string): string | null {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;
    try {
      return new URL(trimmed).toString();
    } catch {
      try {
        return new URL(`https://${trimmed}`).toString();
      } catch {
        return null;
      }
    }
  }
}
