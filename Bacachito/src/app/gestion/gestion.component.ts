import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../services/project.service';
import { CategoryService, Category } from '../services/category.service';
import { ResourceService, Resource } from '../services/resource.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss'
})
export class GestionComponent implements OnInit {
  currentSection: string = 'home';
  currentProcessTab: string = 'entrevistas';
  showModalNewProject: boolean = false;
  showInterviewModal: boolean = false;
  showQuestionModal: boolean = false;
  showObservationModal: boolean = false;
  showStoryModal: boolean = false;
  showFocusGroupModal: boolean = false;
  showDocumentModal: boolean = false;
  showTransactionModal: boolean = false;

  // Projects from backend
  projects: Project[] = [];
  isLoadingProjects: boolean = true;
  projectsError: string | null = null;
  selectedProject: Project | null = null;
  userName: string = '';
  userId: number = 0;

  // New project form
  newProject = {
    name: '',
    description: '',
    deadline: ''
  };
  isCreatingProject: boolean = false;
  createProjectError: string | null = null;

  configProject = {
    name: '',
    description: '',
    deadline: ''
  };
  isSavingConfig: boolean = false;
  isDeletingProject: boolean = false;
  configError: string | null = null;

  categories: Category[] = [];
  isLoadingCategories: boolean = false;
  selectedCategory: Category | null = null;
  showNewCategoryModal: boolean = false;
  showEditCategoryModal: boolean = false;
  newCategory = { name: '', description: '' };
  editCategory = { name: '', description: '' };
  isSavingCategory: boolean = false;
  categoryError: string | null = null;

  resources: Resource[] = [];
  isLoadingResources: boolean = false;
  showUploadModal: boolean = false;
  newResource = { name: '', description: '' };
  selectedFile: File | null = null;
  isUploadingResource: boolean = false;
  resourceError: string | null = null;

  recentResources: Resource[] = [];
  isLoadingRecent: boolean = false;
  recentError: string | null = null;

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
    plantilla documento para hardcoded
    **
  */
  newTransaction = {
    name: '',
    trigger: '',
    steps: [''],
    result: ''
  };

  /* 
    ** 
    cambio de secciones de gestión
    **
  */

  constructor(
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private resourceService: ResourceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.userId = user.id;
        this.userName = user.name || '';
        this.loadProjects(user.id);
      } else {
        this.isLoadingProjects = false;
        this.projectsError = 'No se encontró sesión activa. Inicia sesión de nuevo.';
      }
    } else {
      this.isLoadingProjects = false;
    }
  }

  loadProjects(userId: number): void {
    this.isLoadingProjects = true;
    this.projectsError = null;
    this.projectService.getProjectsByUser(userId).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoadingProjects = false;
      },
      error: (err) => {
        this.isLoadingProjects = false;
        if (err.status === 404) {
          this.projects = [];
          this.projectsError = null;
        } else {
          this.projectsError = 'Error al cargar los proyectos. Intenta más tarde.';
        }
      }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.syncConfigFromSelected();
    this.setSection('dashboard');
    this.loadRecentResources();
  }

  syncConfigFromSelected(): void {
    if (!this.selectedProject) return;
    this.configProject = {
      name: this.selectedProject.name,
      description: this.selectedProject.description || '',
      deadline: this.selectedProject.deadline
        ? this.selectedProject.deadline.substring(0, 10)
        : ''
    };
    this.configError = null;
  }

  saveProjectConfig(): void {
    if (!this.selectedProject) return;
    this.isSavingConfig = true;
    this.configError = null;
    this.projectService.updateProject(this.selectedProject.id, {
      name: this.configProject.name,
      description: this.configProject.description,
      deadline: this.configProject.deadline
    }).subscribe({
      next: () => {
        this.isSavingConfig = false;
        this.selectedProject = {
          ...this.selectedProject!,
          name: this.configProject.name,
          description: this.configProject.description,
          deadline: this.configProject.deadline
        };
        this.loadProjects(this.userId);
      },
      error: () => {
        this.isSavingConfig = false;
        this.configError = 'Error al guardar los cambios.';
      }
    });
  }

  deleteCurrentProject(): void {
    if (!this.selectedProject) return;
    this.isDeletingProject = true;
    this.projectService.deleteProject(this.selectedProject.id).subscribe({
      next: () => {
        this.isDeletingProject = false;
        this.selectedProject = null;
        this.loadProjects(this.userId);
        this.setSection('home');
      },
      error: () => {
        this.isDeletingProject = false;
        this.configError = 'Error al eliminar el proyecto.';
      }
    });
  }

  setSection(section: string) {
    this.currentSection = section;
    if (section === 'configuracion') {
      this.syncConfigFromSelected();
    }
    if (section === 'recursos' && this.selectedProject) {
      this.loadCategories();
    }
    if (section === 'dashboard' && this.selectedProject) {
      this.loadRecentResources();
    }
  }

  setProcessTab(tab: string) {
    this.currentProcessTab = tab;
  }

  loadRecentResources(): void {
    if (!this.selectedProject) return;
    this.isLoadingRecent = true;
    this.recentError = null;
    this.resourceService.getRecentByProject(this.selectedProject.id).subscribe({
      next: (res) => {
        this.recentResources = res;
        this.isLoadingRecent = false;
      },
      error: () => {
        this.isLoadingRecent = false;
        this.recentResources = [];
      }
    });
  }

  goToCategory(categoryId: number): void {
    const cat = this.categories.find(c => c.id === categoryId);
    if (cat) {
      this.selectedCategory = cat;
      this.loadResources();
      this.setSection('recursos');
    } else {
      this.categoryService.getCategoriesByProject(this.selectedProject!.id).subscribe({
        next: (cats) => {
          this.categories = cats;
          const found = cats.find(c => c.id === categoryId);
          if (found) {
            this.selectedCategory = found;
            this.loadResources();
            this.setSection('recursos');
          }
        }
      });
    }
  }

  loadCategories(): void {
    if (!this.selectedProject) return;
    this.isLoadingCategories = true;
    this.categoryError = null;
    this.categoryService.getCategoriesByProject(this.selectedProject.id).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.isLoadingCategories = false;
        if (this.selectedCategory) {
          const still = cats.find(c => c.id === this.selectedCategory!.id);
          this.selectedCategory = still || null;
          if (this.selectedCategory) this.loadResources();
        }
      },
      error: (err) => {
        this.isLoadingCategories = false;
        if (err.status === 404) {
          this.categories = [];
          this.selectedCategory = null;
          this.resources = [];
        } else {
          this.categoryError = 'Error al cargar las categorías.';
        }
      }
    });
  }

  selectCategory(cat: Category): void {
    this.selectedCategory = cat;
    this.resources = [];
    this.resourceError = null;
    this.loadResources();
  }

  loadResources(): void {
    if (!this.selectedCategory) return;
    this.isLoadingResources = true;
    this.resourceError = null;
    this.resourceService.getResourcesByCategory(this.selectedCategory.id).subscribe({
      next: (res) => {
        this.resources = res;
        this.isLoadingResources = false;
      },
      error: (err) => {
        this.isLoadingResources = false;
        if (err.status === 404) {
          this.resources = [];
        } else {
          this.resourceError = 'Error al cargar los recursos.';
        }
      }
    });
  }

  createCategory(): void {
    if (!this.selectedProject || !this.newCategory.name.trim()) return;
    this.isSavingCategory = true;
    this.categoryError = null;
    this.categoryService.createCategory({
      name: this.newCategory.name,
      description: this.newCategory.description,
      id_project: this.selectedProject.id
    }).subscribe({
      next: () => {
        this.isSavingCategory = false;
        this.newCategory = { name: '', description: '' };
        this.showNewCategoryModal = false;
        this.loadCategories();
      },
      error: () => {
        this.isSavingCategory = false;
        this.categoryError = 'Error al crear la categoría.';
      }
    });
  }

  openEditCategory(cat: Category): void {
    this.editCategory = { name: cat.name, description: cat.description || '' };
    this.showEditCategoryModal = true;
  }

  saveEditCategory(): void {
    if (!this.selectedCategory || !this.editCategory.name.trim()) return;
    this.isSavingCategory = true;
    this.categoryService.updateCategory(this.selectedCategory.id, this.editCategory).subscribe({
      next: () => {
        this.isSavingCategory = false;
        this.showEditCategoryModal = false;
        this.loadCategories();
      },
      error: () => {
        this.isSavingCategory = false;
        this.categoryError = 'Error al actualizar la categoría.';
      }
    });
  }

  deleteCategory(cat: Category): void {
    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        if (this.selectedCategory?.id === cat.id) {
          this.selectedCategory = null;
          this.resources = [];
        }
        this.loadCategories();
      },
      error: () => { this.categoryError = 'Error al eliminar la categoría.'; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadResource(): void {
    if (!this.selectedCategory || !this.selectedFile || !this.newResource.name.trim()) return;
    this.isUploadingResource = true;
    this.resourceError = null;
    const fd = new FormData();
    fd.append('file', this.selectedFile);
    fd.append('name', this.newResource.name);
    fd.append('description', this.newResource.description);
    fd.append('id_category', String(this.selectedCategory.id));
    this.resourceService.uploadResource(fd).subscribe({
      next: () => {
        this.isUploadingResource = false;
        this.newResource = { name: '', description: '' };
        this.selectedFile = null;
        this.showUploadModal = false;
        this.loadResources();
      },
      error: () => {
        this.isUploadingResource = false;
        this.resourceError = 'Error al subir el recurso.';
      }
    });
  }

  deleteResource(res: Resource): void {
    this.resourceService.deleteResource(res.id).subscribe({
      next: () => this.loadResources(),
      error: () => { this.resourceError = 'Error al eliminar el recurso.'; }
    });
  }

  getFileIcon(route: string): string {
    const ext = route.split('.').pop()?.toLowerCase();
    if (!ext) return 'insert_drive_file';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'videocam';
    if (['doc', 'docx'].includes(ext)) return 'description';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    return 'insert_drive_file';
  }

  /* 
    **
    abrir y cerrar modales 
    **
  */
  openModal() {
    this.showModalNewProject = true;
    this.createProjectError = null;
  }

  createProject() {
    if (!this.newProject.name.trim()) return;

    this.isCreatingProject = true;
    this.createProjectError = null;

    console.log('1. Enviando petición al backend...');

    this.projectService.createProject({
      name: this.newProject.name,
      id_user: this.userId,
      description: this.newProject.description ? this.newProject.description : null,
      deadline: this.newProject.deadline ? this.newProject.deadline : null
    }).subscribe({
      next: (response) => {
        console.log('2. Respuesta recibida del backend:', response);

        try {
          // Restauramos el botón
          this.isCreatingProject = false;

          // Limpiamos el formulario
          this.newProject = { name: '', description: '', deadline: '' };

          // Cerramos el modal
          console.log('3. Cerrando modal...');
          this.closeModal();

          // Recargamos la lista
          console.log('4. Recargando proyectos...');
          this.loadProjects(this.userId);
        } catch (e) {
          console.error('Error interno al cerrar el modal o recargar:', e);
          this.isCreatingProject = false;
        }
      },
      error: (err) => {
        console.error('2. Error devuelto por el backend:', err);
        this.isCreatingProject = false;
        this.createProjectError = 'Error al crear el proyecto. Intenta de nuevo.';
      }
    });
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

  openTransactionModal() {
    this.showTransactionModal = true;
  }

  closeModal() {
    this.showModalNewProject = false;
    this.showInterviewModal = false;
    this.showQuestionModal = false;
    this.showObservationModal = false;
    this.showStoryModal = false;
    this.showFocusGroupModal = false;
    this.showDocumentModal = false;
    this.showTransactionModal = false;

    this.newInterview = {
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
    Funciones para transacción
    - agregar paso
    - remover paso
    **
  */
  addTransactionStep() {
    this.newTransaction.steps.push('');
  }

  removeTransactionStep(index: number) {
    if (this.newTransaction.steps.length > 1) {
      this.newTransaction.steps.splice(index, 1);
    }
  }

}
