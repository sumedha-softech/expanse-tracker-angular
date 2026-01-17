import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Log } from "../models/log.model";
import { environment } from "../../environments/environment";


@Injectable({
    providedIn: 'root' 
})

export class LogService {
   private apiUrl = `${environment.apiUrl}/logs/`

    constructor(private http: HttpClient) {}


    getAllLogs():Observable<{data: Log[]}> {
    return this.http.get<{data: Log[]}>(this.apiUrl);
    }

}