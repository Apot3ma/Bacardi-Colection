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
  showQuestionModal: boolean = false;
  showObservationModal: boolean = false;
  showStoryModal: boolean = false;
  showFocusGroupModal: boolean = false;
  showDocumentModal: boolean = false;

  /*
    **
    plantilla entrevista para hardcoded
    **
  */
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

  /*
    **
    plantilla cuestionario para hardcoded
    **
  */
  newQuestion = {
    title: '',
    description: '',
    questions: [
      {
        text: '',
        type: 'a', // <-- 'a', 'c' o 'm' 
        options: ['Opción 1', 'Opción 2'] 
      }
    ]
  };

  /*
    **
    plantilla observación para hardcoded
    **
  */
  newObservation = {
    context: '', 
    date: new Date().toISOString().split('T')[0], 
    notes: [''] 
  };

  /*
    **
    plantilla historia de usuario para hardcoded
    **
  */
  newStory = {
    identifier: '', 
    title: '',
    role: '',       
    action: '',     
    benefit: '',    
    priority: 'Media', 
    criteria: ['']  
  };

  /*
    **
    plantilla focus group - lluvia de ideas para hardcoded
    **
  */
  newFocusGroup = {
    topic: '', 
    date: new Date().toISOString().split('T')[0],
    participants: [''], 
    ideas: ['']         
  };

  /*
    **
    plantilla documento para hardcoded
    **
  */
  newDocument = {
    title: '',
    description: '',
    fileName: '' 
  };

  /* 
    ** 
    cambio de secciones de gestión
    **
  */
  setSection(section: string) {
    this.currentSection = section;
  }

  setProcessTab(tab: string) {
    this.currentProcessTab = tab;
  }

  /* 
    **
    abrir y cerrar modales 
    **
  */
  openModal() {
    this.showModalNewProject = true;
  }


  openInterviewModal() {
    this.showInterviewModal = true;
  }
  
  openQuestionnaireModal() {
    this.showQuestionModal = true;
  }

  openObservationModal() {
    this.showObservationModal = true;
  }

  openStoryModal() {
    this.showStoryModal = true;
  }

  openFocusGroupModal() {
    this.showFocusGroupModal = true;
  }

  openDocumentModal() {
    this.showDocumentModal = true;
  }

  closeModal() {
    this.showModalNewProject = false;
    this.showInterviewModal = false;
    this.showQuestionModal = false;
    this.showObservationModal = false;
    this.showStoryModal = false;
    this.showFocusGroupModal = false;
    this.showDocumentModal = false;

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

    this.newObservation = {
      context: '', 
      date: new Date().toISOString().split('T')[0], 
      notes: [''] 
    };

    this.newDocument = { 
      title: '', 
      description: '', 
      fileName: '' 
    };
  }

  /* 
    ** funciones para la entrevista 
      - agregar seccion
      - eliminar seccion
      - agregar pregunta
      - eliminar pregunta
    **
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

  /* 
    **
    esta función ayuda a entrevistas a poder escribir en los recuadros de preguntas de entrevista 
    **
  */
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  /* 
    **
    funciones para cuestionario
    - agregar pregunta
    - eliminar pregunta
    - agregar opción (opcion multiple)
    - eliminar opción (opcion multiple)
    **
  */
  addQuestionQuestion() {
    this.newQuestion.questions.push({
      text: '',
      type: 'a',
      options: ['Opción 1']
    });
  }

  removeQuestionnaireQuestion(index: number) {
    if (this.newQuestion.questions.length > 1) {
      this.newQuestion.questions.splice(index, 1);
    }
  }

  addOption(questionIndex: number) {
    this.newQuestion.questions[questionIndex].options.push('');
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const options = this.newQuestion.questions[questionIndex].options;
    if (options.length > 1) {
      options.splice(optionIndex, 1);
    }
  }

  /* 
    **
    Funciones para observación
    - agregar nota
    - eliminar nota
    **
  */
  addObservationNote() {
    this.newObservation.notes.push('');
  }

  removeObservationNote(index: number) {
    if (this.newObservation.notes.length > 1) {
      this.newObservation.notes.splice(index, 1);
    }
  }

  /* 
    **
    Funciones para historia de usuario
    - agregar criterio
    - eliminar criterio
    **
  */
  addCriterion() {
    this.newStory.criteria.push('');
  }

  removeCriterion(index: number) {
    if (this.newStory.criteria.length > 1) {
      this.newStory.criteria.splice(index, 1);
    }
  }

  /* 
    **
    Funciones para focus group - lluvia de ideas
    - añadir participante
    - remover participante
    - añadir idea
    - remover idea
    **
  */
  addParticipant() {
    this.newFocusGroup.participants.push('');
  }

  removeParticipant(index: number) {
    if (this.newFocusGroup.participants.length > 1) {
      this.newFocusGroup.participants.splice(index, 1);
    }
  }

  addIdea() {
    this.newFocusGroup.ideas.push('');
  }

  removeIdea(index: number) {
    if (this.newFocusGroup.ideas.length > 1) {
      this.newFocusGroup.ideas.splice(index, 1);
    }
  }

  /* 
    **
    Funciones para documentos
    - seleccionar archivo y mostrar nombre
    **
  */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newDocument.fileName = file.name;
    }
  }

}
