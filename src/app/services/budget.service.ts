import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, retry } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class BudgetService {

    private apiUrl = `${environment.apiUrl}/budgets/`
    constructor(private http: HttpClient) { }

    getAllBudget(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    setNewBudget(details: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, details)
    }
    updateBudget(details: any): Observable<any> {
        return this.http.put<any>(this.apiUrl + `${details._id}`, details)
    }

    deleteCategorySetBudget(id: string): Observable<any> {
        return this.http.delete<any>(this.apiUrl + `${id}`)
    }

}