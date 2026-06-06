import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Diagram {
  id?: number;
  id_project: number;
  name: string;
  content: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  private readonly apiUrl = 'http://localhost:3000/api/diagrams';

  constructor(private http: HttpClient) {}

  getDiagramsByProject(projectId: number): Observable<Diagram[]> {
    return this.http.get<Diagram[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createDiagram(data: Diagram): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, data);
  }

  updateDiagram(id: number, data: Partial<Diagram>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteDiagram(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
