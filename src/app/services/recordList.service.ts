import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RecordList } from "../models/recordlist.model";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})

export class RecordListService {

    private apiurl = `${environment.apiUrl}/record/`
    constructor(private http: HttpClient) { }


    getAllRecord(): Observable<{data: RecordList[]}> {
        return this.http.get<{data: RecordList[]}>(this.apiurl + `getAllRecord`);
    }

    addNewRecord(record: RecordList): Observable<RecordList> {
        return this.http.post<RecordList>(this.apiurl + `addNewRecord`, record)
    }

    deleteRecord(id: string): Observable<RecordList> {
        return this.http.delete<RecordList>(this.apiurl + `deleteRecord/${id}`)
    }
    
    getRecordById(id: string): Observable<RecordList> {
        return this.http.get<RecordList>(this.apiurl + `get/${id}`)
    }

    updateRecord(record: RecordList): Observable<RecordList> {
        return this.http.put<RecordList>(this.apiurl + `updateRecord/${record._id}`, record)
    }
}