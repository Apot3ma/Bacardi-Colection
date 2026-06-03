import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description: string;
  date_creation: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = 'http://localhost:3000/api/categories';

  constructor(private http: HttpClient) {}

  getCategoriesByProject(projectId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/${projectId}`);
  }

  createCategory(data: { name: string; description: string; id_project: number }): Observable<{ id: number }> {
    const date_creation = new Date().toISOString().slice(0, 19).replace('T', ' ');
    return this.http.post<{ id: number }>(this.apiUrl, { ...data, date_creation });
  }

  updateCategory(id: number, data: { name: string; description: string }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
