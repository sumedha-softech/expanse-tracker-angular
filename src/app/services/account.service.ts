import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Account } from "../models/account.model";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AccountService {

    private apiUrl = `${environment.apiUrl}/account/`

    constructor(private http: HttpClient) { }

    getAllAccount(): Observable<{ data: Account[] }> {
        return this.http.get<{ data: Account[] }>(this.apiUrl + `getAllAccount`)
    }

    getAccountById(id: string): Observable<Account> {
        return this.http.get<Account>(this.apiUrl + `get/${id}`)
    }

    addAccount(account: Account): Observable<Account> {
        return this.http.post<Account>(this.apiUrl + `addAccount`, account)
    }

    deleteAccount(id: string): Observable<Account> {
        return this.http.delete<Account>(this.apiUrl + `deleteAccount/${id}`)
    }

    updateAccount(details: any): Observable<Account> {
        return this.http.put<Account>(this.apiUrl + 'updateAccount', details);
    }

    amountTransfer(account: Account): Observable<Account> {
        return this.http.post<Account>(this.apiUrl + `transferAmount`, account)
    }

    updateTransferAmount(details: { fromAccount: string, toAccount: string, amount: number }): Observable<any> {
        return this.http.put<any>(this.apiUrl + `updateTransferAmount`, details)
    }

}