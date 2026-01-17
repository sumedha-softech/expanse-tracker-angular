import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RecordList } from "../models/recordlist.model";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class RecordListService {

    private apiurl = `${environment.apiUrl}/records/`
    constructor(private http: HttpClient) { }


    getAllRecord(): Observable<{data: RecordList[]}> {
        return this.http.get<{data: RecordList[]}>(this.apiurl);
    }

    addNewRecord(record: RecordList): Observable<RecordList> {
        return this.http.post<RecordList>(this.apiurl, record)
    }

    deleteRecord(id: string): Observable<RecordList> {
        return this.http.delete<RecordList>(this.apiurl + `${id}`)
    }
    
    getRecordById(id: string): Observable<RecordList> {
        return this.http.get<RecordList>(this.apiurl + `${id}`)
    }

    updateRecord(record: RecordList): Observable<RecordList> {
        return this.http.put<RecordList>(this.apiurl + `${record._id}`, record)
    }
}