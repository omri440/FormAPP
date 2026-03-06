import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission, SubmitFormRequest } from '../models/submission.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SubmissionsService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  submitForm(formId: number, data: SubmitFormRequest): Observable<Submission> {
    return this.http.post<Submission>(`${this.base}/forms/${formId}/submit`, data);
  }

  getSubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.base}/submissions`);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.base}/submissions/my`);
  }

  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.base}/submissions/${id}`);
  }

  exportSubmissionsExcel(): Observable<Blob> {
    return this.http.get(`${this.base}/submissions/export/excel`, {
      responseType: 'blob',
    });
  }
}
