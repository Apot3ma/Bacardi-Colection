import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoryPermission {
  id_user: number;
  permission: number;
  name: string;
  email: string;
}

export interface GrantPermissionRequest {
  id_user: number;
  id_category: number;
  permission: number;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly apiUrl = 'http://localhost:3000/api/permissions';

  constructor(private http: HttpClient) {}

  getPermissionsByCategory(categoryId: number): Observable<CategoryPermission[]> {
    return this.http.get<CategoryPermission[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getUserPermissionForCategory(userId: number, categoryId: number): Observable<{ permission: number }> {
    return this.http.get<{ permission: number }>(`${this.apiUrl}/user/${userId}/category/${categoryId}`);
  }

  grantPermission(data: GrantPermissionRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.apiUrl, data);
  }

  revokePermission(userId: number, categoryId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}/${categoryId}`);
  }
}
