import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Account } from "../models/account.model";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AccountService {

    private apiUrl = `${environment.apiUrl}/accounts/`

    constructor(private http: HttpClient) { }

    getAllAccount(): Observable<{ data: Account[] }> {
        return this.http.get<{ data: Account[] }>(this.apiUrl)
    }

    fetchAccountById(id: string): Observable<Account> {
        return this.http.get<Account>(this.apiUrl +`/${id}`)
    }

    addAccount(account: Account): Observable<Account> {
        return this.http.post<Account>(this.apiUrl, account)
    }

    deleteAccount(id: string): Observable<Account> {
        return this.http.delete<Account>(this.apiUrl + `${id}`)
    }

    updateAccount(details: any): Observable<Account> {
        return this.http.put<Account>(this.apiUrl + 'updateAccount', details);
    }
    
    amountTransfer(account: Account): Observable<Account> {
        return this.http.post<Account>(this.apiUrl + `transfer`, account)
    }

    updateTransferAmount(id: string): Observable<Account> {
        return this.http.put<Account>(this.apiUrl + `transfer/${id}`, id)
    }

}