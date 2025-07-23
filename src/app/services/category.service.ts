import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'http://localhost:3000/api/category/'
  constructor(private http: HttpClient) { }


  getAllCategory(): Observable<{data: Category[]}> {
    return this.http.get<{data:Category[]}>(this.apiUrl + `getAllCategory`)
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl + `addCategory`, category)
  }

  updateCategory(category: Category) {
    return this.http.put(this.apiUrl + `updateCategory/${category._id}`, category)
  }

  deleteCategory(id: string): Observable<Category> {
    return this.http.delete<Category>(this.apiUrl + `deleteCategory/${id}`)
  }

}
