import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TeamMember {
  id: string;
  nombre: string;
  rol: string;
}

@Component({
  selector: 'app-gestion',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss' 
})
export class GestionComponent {
  currentSection: string = 'dashboard';
  
  // Team management
  teamMembers: TeamMember[] = [];
  newMember = {
    nombre: '',
    rol: ''
  };
  
  rolesDisponibles = ['Desarrollador', 'Diseñador', 'Project Manager', 'QA', 'DevOps', 'Líder de Equipo'];

  setSection(section: string) {
    this.currentSection = section;
  }

  addTeamMember() {
    if (this.newMember.nombre.trim() && this.newMember.rol.trim()) {
      const newId = 'TEAM-' + (this.teamMembers.length + 1).toString().padStart(3, '0');
      this.teamMembers.push({
        id: newId,
        nombre: this.newMember.nombre,
        rol: this.newMember.rol
      });
      this.newMember = { nombre: '', rol: '' };
    }
  }

  removeMember(index: number) {
    this.teamMembers.splice(index, 1);
  }
}
