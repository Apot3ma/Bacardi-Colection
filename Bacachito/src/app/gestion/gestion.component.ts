import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss' 
})
export class GestionComponent {
  currentSection: string = 'dashboard';

  setSection(section: string) {
    this.currentSection = section;
  }
}
