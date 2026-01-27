import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RagApiService } from '../../services/rag-api.service.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

@Component({
  standalone: true,
  selector: 'app-query',
  imports: [CommonModule, FormsModule],
  templateUrl: './query.component.html'
})
export class QueryComponent {
  question = '';
  documentId: string;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: RagApiService,
    private router: Router
  ) {
    this.documentId = this.route.snapshot.params['documentId'];
  }

  ask() {
    if (!this.question) return;

    this.loading = true;
    this.startThinkingAnimation();
    this.api.query(this.documentId, this.question).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/results'], {
          state: { response: res }
        });
      },
      error: () => (this.loading = false)
    });
  }

  startThinkingAnimation() {
    gsap.to('.dot', {
      opacity: 0.3,
      stagger: 0.2,
      repeat: -1,
      yoyo: true
    });
  }

  goBack() {
    this.router.navigate(['/upload']);
  }
}  
