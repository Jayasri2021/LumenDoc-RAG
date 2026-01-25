import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

@Component({
  standalone: true,
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.component.html'
})
export class ResultsComponent implements AfterViewInit {
  answer = '';
  sources: any[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as any;

    if (state?.response) {
      this.answer = state.response.answer;
      this.sources = state.response.sources;
    }
  }

  ngAfterViewInit() {
    gsap.registerPlugin(TextPlugin);
    if (this.answer) {
      this.typeAnswer(this.answer);
    }
  }

  typeAnswer(text: string) {
    // Clear initial text to prevent duplication if binding renders it first
    gsap.set('.answer-text', { text: '' });

    gsap.to('.answer-text', {
      text: text,
      duration: Math.min(text.length / 20, 4), // Adjusted speed
      ease: 'none'
    });
  }
}
