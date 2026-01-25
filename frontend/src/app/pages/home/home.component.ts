// button Get started should navigate to upload page
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {  
  // button click for upload()
  upload() {
    window.location.href = '/upload';
  }

}
