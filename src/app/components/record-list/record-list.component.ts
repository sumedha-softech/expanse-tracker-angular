import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { MatSnackBar } from '@angular/material/snack-bar'
import { AccountService } from '../../services/account.service';
import { Account } from '../../models/account.model';
import { RecordListService } from '../../services/recordList.service';
import { RecordList } from '../../models/recordlist.model';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';




@Component({
  selector: 'app-record-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDatepickerModule, MatIconModule, MatFormFieldModule, MatMenuModule, MatTimepickerModule],
  templateUrl: './record-list.component.html',
  styleUrl: './record-list.component.css',

})
export class RecordListComponent implements OnInit, OnDestroy {
  categoryList: Category[] = [];
  accountList: Account[] = [];
  recordList: RecordList[] = []
  recordListForm: FormGroup;
  showForm: boolean = false;
  categoryType: string[] = ['income', 'expense'];
  filteredCategoryList: Category[] = [];
  incomeCategoryList: Category[] = [];
  expenseCategoryList: Category[] = []
  isEditRecord: boolean = false;
  selectedRecordId!: string;
  private destroy$ = new Subject<void>();


  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private recordService: RecordListService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private snackbar: MatSnackBar) {
    this.recordListForm = this.fb.group({
      amount: [null,  [Validators.required, Validators.min(1)]],
      type: ['', [Validators.required]],
      addNote: [''],
      category: ['', [Validators.required]],
      account: ['', [Validators.required]],
      date: [this.selectedDate]
    })
  }


  totalExpense: number = 0;
  totalIncome: number = 0;
  totalAmount: number = 0;
  selectMonthLabel!: string;
  selectMonth!: string
  selectedDate = new Date();
  formattedDate!: string


  showError(message: string) {
    this.snackbar.open(message, 'Close', { duration: 2000 });
  }

  ngOnInit(): void {
    const today = new Date();
    this.selectMonth = today.toISOString().slice(0, 7);
    this.getAllCategories();
    this.getAllRecord();
    this.getAllAccount();
    this.recordListForm.get('type')?.valueChanges.subscribe(() => this.onTypeChange())
    this.updateSelectedDate(this.selectedDate);
  }

  //fatch all available accounts
  getAllAccount() {
    this.accountService.getAllAccount().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: Account[] }) => {
        this.accountList = res?.data ?? [];
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed To Fatch accounts')
      }
    })
  }


  //fatch available categories
  getAllCategories() {
    this.categoryService.getAllCategory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: Category[] }) => {
        this.categoryList = res?.data ?? [];
        this.incomeCategoryList = this.categoryList.filter(category => category.type === 'income');
        this.expenseCategoryList = this.categoryList.filter(category => category.type === 'expense')
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed To Fatch Categories')
      }
    })

  }

  //filterd Ctaegory
  onTypeChange() {
    const selectedCategoryType = this.recordListForm.get('type')?.value;
    if (selectedCategoryType === 'income') {
      this.filteredCategoryList = this.incomeCategoryList;
    } else if (selectedCategoryType === 'expense') {
      this.filteredCategoryList = this.expenseCategoryList;
    }
  }

  filteredRecordList: RecordList[] = [];
  transactionRecords: { [key: string]: RecordList[] } = {};
  groupedDates: string[] = [];


  //fatch all Available Records
  getAllRecord() {
    this.recordService.getAllRecord().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: RecordList[] }) => {
        this.recordList = res?.data ?? [];
        this.onMonthChange();
      },
      error: (error) => {
        console.error(error);
        this.showError('No transaction found')
      }
    });
  }


  //calculat total Amoun tof incomeand expense
  calculateTotal() {
    this.totalIncome = 0;
    this.totalExpense = 0;
    this.totalAmount = 0;
    this.filteredRecordList.forEach((record: RecordList) => {
      const amount = Number(record.amount);
      if (record.type === 'income') {
        this.totalIncome += amount;
      } else if (record.type === 'expense') {
        this.totalExpense += amount;
      }
    });
    this.totalAmount = this.totalIncome - this.totalExpense;
  }

  // Filter only records for selected month
  onMonthChange() {
    const selectedDate = new Date(this.selectMonth);
    this.selectMonthLabel = selectedDate.toISOString();
    this.filteredRecordList = this.recordList.filter(record =>
      new Date(record.date).toISOString().slice(0, 7) === this.selectMonth
    );
    this.groupTransactions()
    this.calculateTotal();

  }
  //grouped transaction in array
  groupTransactions() {
    this.transactionRecords = {}
    this.filteredRecordList.forEach((record: RecordList) => {
      const date = new Date(record.date).toISOString().slice(0, 10);
      if (!this.transactionRecords[date]) {
        this.transactionRecords[date] = [];
      }
      this.transactionRecords[date].push(record);
    });
    //
    this.groupedDates = Object.keys(this.transactionRecords).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }



  //add new Record
  addNewRecord() {
    if(this.recordListForm.invalid) {
      this.recordListForm.markAllAsTouched();
      return;
    }
    this.recordService.addNewRecord(this.recordListForm.value).subscribe({
      next: () => {
        this.snackbar.open('Record Added Successfully.', 'close', { duration: 3000 });
        this.resetForm();
        this.getAllRecord();
        this.getAllAccount();
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to Create Record');
      },
    })
  }

  openConfirmDialog(id: string): void {
    const dialog= this.dialog.open(ConfirmDialogComponent);
    dialog.afterClosed().subscribe((data) => {
      if (data === true) {
        this.deleteRecord(id);
      }
    });
  }
  //delete Recordby recordId
  deleteRecord(id: string) {
    this.recordService.deleteRecord(id).subscribe({
      next: () => {
        this.snackbar.open('Transaction Delete Successfully.!', 'close', { duration: 3000 });
        this.recordList = this.recordList.filter(record => record._id !== id)
        this.onMonthChange();
        this.getAllAccount();
      },
      error: (err) => {
        console.log(err);
        this.showError('Delete Record Failed')
      },
    })
  }

  //edit record
  editRecord(record: RecordList) {
    this.showForm = true;
    this.isEditRecord = true;
    this.selectedRecordId = record._id;
    const date = new Date(record.date);
    this.selectedDate = date;

    //udpate Form Details
    this.recordListForm.patchValue({
      account: record.account,
      amount: record.amount,
      type: record.type,
      addNote: record.addNote,
      category: record.category,
      date: date
    });
  }

  //update SelectedRecord
  updateRecord() {
     if(this.recordListForm.invalid) {
      this.recordListForm.markAllAsTouched();
      return;
    }
    const updateRecordDetails = {
      _id: this.selectedRecordId,
      ...this.recordListForm.value
    }
    this.recordService.updateRecord(updateRecordDetails).subscribe({
      next: () => {
        this.snackbar.open('Record Updated SuccessFully', 'close', { duration: 3000 });
        this.resetForm();
        this.getAllRecord();
        this.getAllAccount();

      },
      error: (err) => {
        console.error(err);
        this.showError('Record update Failed.')
      }
    })
  }


  previousMonth(): void {
    const date = new Date(this.selectMonth);
    date.setMonth(date.getMonth() - 1);
    this.selectMonth = date.toISOString().slice(0, 7);
    this.onMonthChange();
  }

  nextMonth(): void {
    const date = new Date(this.selectMonth);
    date.setMonth(date.getMonth() + 1);
    this.selectMonth = date.toISOString().slice(0, 7);
    this.onMonthChange();
  }


  getAccountName(id: string) {
    const account = this.accountList.find(account => account._id == id);
    return account ? account.name : ''
  }

  getCategoryName(id: string) {
    const category = this.categoryList.find(category => category._id == id);
    return category ? category.name : ''
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.recordListForm.reset({
        amount: null,
        type: 'expense',
        addNote: '',
        category: '',
        account: '',
        date: new Date(),
      });

      this.onTypeChange();
    }
  }


  //on Date selected
  onSelectedDate(event: any) {
    if (event.value) {
      const [hours, minutes] = this.getTimeValue(this.selectedDate).split(':').map(Number);
      const newDate = new Date(event.value);
      newDate.setHours(hours, minutes);
      this.selectedDate = newDate;
      this.recordListForm.get('date')?.setValue(newDate);
      this.updateSelectedDate(newDate);
    }
  }

  selectedTime(event: Event) {
    const [hours, minutes] = (event.target as HTMLInputElement).value.split(':').map(Number);
    this.selectedDate.setHours(hours, minutes);
    this.recordListForm.get('date')?.setValue(new Date(this.selectedDate));
    this.updateSelectedDate(this.selectedDate);
  }

  updateSelectedDate(date: Date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    this.formattedDate = date.toLocaleDateString('en-US', options);
  }

  getTimeValue(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  closeForm() {
    this.showForm = false;
    this.resetForm()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetForm() {
    this.recordListForm.reset();
    this.showForm = false;
    this.isEditRecord = false;
  }

  //edit account created with initial Amount
  editAccountRecord(record: RecordList) {
    this.router.navigate(['/account'], {
      queryParams: {
        accountId: record.account,
        recordId: record._id
      },
    })
  }


  //edit a transfer amount record
  editTransferRecord(record: RecordList) {
    this.router.navigate(['/account'], {
      queryParams: {
        recordId: record._id,
      }
    })
  }


  get form() {
    return this.recordListForm.controls;
  }
}


