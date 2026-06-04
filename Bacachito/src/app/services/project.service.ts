import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  id_user?: number;
  description: string;
  deadline: string;
}

export interface CreateProjectRequest {
  name: string;
  id_user: number;
  description?: string | null;
  deadline?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = 'http://localhost:3000/api/projects';

  constructor(private http: HttpClient) { }

  getProjectsByUser(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/${userId}`);
  }

  createProject(data: CreateProjectRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, data);
  }

  updateProject(projectId: number, data: { name: string; description: string; deadline: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${projectId}`, data);
  }

  deleteProject(projectId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${projectId}`);
  }
}
