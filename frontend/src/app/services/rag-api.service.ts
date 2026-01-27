import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.js';

@Injectable({ providedIn: 'root' })
export class RagApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  uploadPdf(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ document_id: string }>(
      `${this.baseUrl}/documents/upload`,
      formData
    );
  }

  ingestUrl(url: string) {
    return this.http.post<{ document_id: string }>(`${this.baseUrl}/documents/ingest-url`, {
      url
    });
  }

  query(documentId: string, question: string) {
    return this.http.post<{ answer: string }>(`${this.baseUrl}/query`, {
      document_id: documentId,
      question
    });
  }
}
