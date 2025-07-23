export interface RecordList {
    _id: string,
    addNote: string,
    amount: string,
    type:string,
    account: string,
    category: string,
    date: Date,
   isInitialEntry: boolean,
   isTransfer: boolean,
}