export interface Account {
  _id: string;
  name: string;
  amount: number;
  recordId: {
    _id: string;
    amount: number,
  };
}
