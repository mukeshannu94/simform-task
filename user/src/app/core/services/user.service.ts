import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private apiService: ApiService
    ) {
    }
    login(data: any): Observable<any> {
        return this.apiService.post('/api/v1/user/login', data)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }

    register(data: any): Observable<any> {
        return this.apiService.post('/api/v1/user/register', data)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }
    usersList(data: any): Observable<any> {
        return this.apiService.post('/api/v1/user/usersList', data)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }
    userDetail(_id: string): Observable<any> {
        return this.apiService.get(`/api/v1/user/userDetail/${_id}`,)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }
    updateUser(data: any, _id: string): Observable<any> {
        return this.apiService.put(`/api/v1/user/updateUser/${_id}`, data)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }
    logout(): Observable<any> {
        return this.apiService.get(`/api/v1/user/logout`,)
            .pipe(map(
                res => {
                    return res;
                }
            ));
    }
}
