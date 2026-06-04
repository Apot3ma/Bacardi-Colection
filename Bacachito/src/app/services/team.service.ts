import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface TeamMember {
    id: number;
    id_project: number;
    id_user: number;
    role: string;
    name?: string;
    email?: string;
}
export interface UserSearchResult {
    id: number;
    name: string;
    email: string;
}
export interface AddMemberRequest {
    id_project: number;
    id_user: number;
    role: string;
}
@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private readonly apiUrl = 'http://localhost:3000/api/userlog';
    constructor(private http: HttpClient) { }
    searchUserByEmail(email: string, projectId?: number): Observable<UserSearchResult> {
        let url = `${this.apiUrl}/search?email=${encodeURIComponent(email)}`;
        if (projectId) {
            url += `&id_project=${projectId}`;
        }
        return this.http.get<UserSearchResult>(url);
    }
    getMembersByProject(projectId: number): Observable<TeamMember[]> {
        return this.http.get<TeamMember[]>(`${this.apiUrl}/project/${projectId}`);
    }
    addMember(data: AddMemberRequest): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.apiUrl, data);
    }
}