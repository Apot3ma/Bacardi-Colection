import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resource {
  id: number;
  name: string;
  description: string;
  route: string;
  date_update: string;
  id_category: number;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly apiUrl = 'http://localhost:3000/api/resources';

  constructor(private http: HttpClient) {}

  getResourcesByCategory(categoryId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/${categoryId}`);
  }

  getRecentByProject(projectId: number): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/recent/${projectId}`);
  }

  uploadResource(formData: FormData): Observable<{ id: number; route: string }> {
    return this.http.post<{ id: number; route: string }>(this.apiUrl, formData);
  }

  deleteResource(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
