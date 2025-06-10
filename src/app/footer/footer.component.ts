// src/app/footer/footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor, etc. (good practice)
import { RouterLink } from '@angular/router';   // For routerLink directive

@Component({
  selector: 'app-footer',
  standalone: true, // Mark as standalone
  imports: [CommonModule, RouterLink], // Import necessary Angular modules
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'] // You can add specific styles here
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear(); // Get current year for copyright

  constructor() { }

  ngOnInit(): void { }
}