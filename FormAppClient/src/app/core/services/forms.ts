import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppForm, CreateFormRequest } from '../models/form.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/forms`;

  getForms(): Observable<AppForm[]> {
    return this.http.get<AppForm[]>(this.base);
  }

  getFormById(id: number): Observable<AppForm> {
    return this.http.get<AppForm>(`${this.base}/${id}`);
  }

  createForm(data: CreateFormRequest): Observable<AppForm> {
    return this.http.post<AppForm>(this.base, data);
  }

  deleteForm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
