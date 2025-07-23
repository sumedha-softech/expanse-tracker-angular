import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Log } from "../models/log.model";


@Injectable({
    providedIn: 'root' 
})

export class LogService {
   private apiUrl = 'http://localhost:3000/api/log/'

    constructor(private http: HttpClient) {}


    getAllLogs():Observable<{data: Log[]}> {
    return this.http.get<{data: Log[]}>(this.apiUrl+ `getAllLogs`);
    }

}