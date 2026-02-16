import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss' 
})
export class GestionComponent {
  currentSection: string = 'home';
  currentProcessTab: string = 'entrevistas';
  showModalNewProject: boolean = false;
  showInterviewModal: boolean = false;

  //plantilla entrevista para hardcoded
  newInterview = {
    title: '',
    interviewee: '',
    sections: [
      {
        title: 'Sección General', 
        questions: [''] 
      }
    ]
  };

  // cambio de secciones de gestión
  setSection(section: string) {
    this.currentSection = section;
  }

  setProcessTab(tab: string) {
    this.currentProcessTab = tab;
  }

 // abrir y cerrar modales
  openModal() {
    this.showModalNewProject = true;
  }

  openInterviewModal() {
    this.showInterviewModal = true;
  }

  closeModal() {
    this.showModalNewProject = false;
    this.showInterviewModal = false;

    this.newInterview =  {
      title: '',
      interviewee: '',
      sections: [
        {
          title: 'Sección General', 
          questions: [''] 
        }
      ]
    };

  }

  /* funciones para la entrevista 
   - agregar seccion
   - eliminar seccion
   - agregar pregunta
   - eliminar pregunta
  */ 
  addSection() {
    this.newInterview.sections.push({
      title: '',
      questions: ['']
    });
  }

  removeSection(index: number) {
    if (this.newInterview.sections.length > 1) {
      this.newInterview.sections.splice(index, 1);
    }
  }

  addQuestion(sectionIndex: number) {
    this.newInterview.sections[sectionIndex].questions.push('');
  }

  removeQuestion(sectionIndex: number, questionIndex: number) {
    const questions = this.newInterview.sections[sectionIndex].questions;
    if (questions.length > 1) {
      questions.splice(questionIndex, 1);
    }
  }
}
