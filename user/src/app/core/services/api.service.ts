import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { JwtService } from './jwt.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
    constructor(
        private http: HttpClient,
        private jwtService: JwtService
    ) { }

    private formatErrors(error: any): any {
        return new Error(error.error);
    }

    get(path: string): Observable<any> {
        return this.http.get(`${environment.api_url}${path}`)
            .pipe(catchError(this.formatErrors));
    }
    delete(path: string): Observable<any> {
        return this.http.delete(`${environment.api_url}${path}`)
            .pipe(catchError(this.formatErrors));
    }
    post(path: string, body: object = {}): Observable<any> {
        return this.http.post(
            `${environment.api_url}${path}`,
            body
        ).pipe(catchError(this.formatErrors));
    }
    put(path: string, body: object = {}): Observable<any> {
        return this.http.put(
            `${environment.api_url}${path}`,
            body
        ).pipe(catchError(this.formatErrors));
    }
}
