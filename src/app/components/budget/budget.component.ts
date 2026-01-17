import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecordListService } from '../../services/recordList.service';
import { CategoryService } from '../../services/category.service';
import { BudgetService } from '../../services/budget.service';
import { RecordList } from '../../models/recordlist.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../models/category.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-budget',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css',
})

export class BudgetComponent implements OnInit, OnDestroy {
  addBudgetForm: FormGroup;
  categoryList: Category[] = [];
  availbleCategoryList: Category[] = []
  budgetList: any[] = [];
  filteredBudgetList: any[] = []
  recordList: RecordList[] = [];
  selectedCategoryId: string | null = null;
  selectedCategoryName!: string;
  selectedBudgetId: string | null = null;
  showForm: boolean = false;
  isEditMode = false;
    private destroy$ = new Subject<void>();

  formattedDate!: string
  selectedDate = new Date()
  selectMonth!: string;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private budgetService: BudgetService,
    private recordListService: RecordListService
  ) {
    this.addBudgetForm = this.fb.group({
      limit: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    const today = new Date();
    this.selectMonth = today.toISOString().slice(0, 7);
    this.getAllCategory();
    this.getAllRecords();
    this.updateSelectedMonth(today);
  }

  //fatch all available categories
  getAllCategory() {
    this.categoryService.getAllCategory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: Category[] }) => {
        this.categoryList = res?.data ?? [];
        this.updateAvailableCategories();
      },
      error: (err) => {
        console.error(err);
        this.showError('Unable to fetch categories');
      },
    });
  }
  

  //fatch all Records
  getAllRecords() {
    this.recordListService.getAllRecord().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: RecordList[] }) => {
        this.recordList = res?.data?? [];
        this.getAllBudgetList();
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to fetch records');
      },
    });
  }


  //fatch all available budget category list
  getAllBudgetList() {
    this.budgetService.getAllBudget().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const budgetData = res?.data?? [];
        this.budgetList = budgetData.map((budget: any) => {
          const spent = this.calculateSpentAmount(budget.category);
          return {
            ...budget,
            spent,
          };
        });
        this.onMonthChange();
        this.updateAvailableCategories();
      },
      error: (err) => {
        console.error(err);
        this.showError('Unable to Fatch budget')
      },
    });
  }

  //update catgory after set monthly budget with selected category
  updateAvailableCategories() {
    if (this.categoryList.length && this.budgetList.length >= 0) {
      this.availbleCategoryList = this.getExpenseCategories();
    }
  }

  getExpenseCategories(): Category[] {
    const usedCategoryByUser = this.filteredBudgetList.map(setBudget => setBudget.category);
    return this.categoryList.filter(category => category.type === 'expense' && !usedCategoryByUser.includes(category._id))
  }


  //calculate spent amount of selcted category
  calculateSpentAmount(categoryId: string) {
    const selectedDate = new Date(this.selectMonth);
    return this.recordList.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.category === categoryId &&
        record.type === 'expense' &&
        recordDate.getFullYear() === selectedDate.getFullYear() &&
        recordDate.getMonth() === selectedDate.getMonth()
      );
    }).reduce((total, record) => total+ Number(record.amount), 0);
  }

  onMonthChange() {
    this.filterBudgetsByMonth();
    this.updateSelectedMonth(new Date(this.selectMonth));
  }

  //filter budget with selected month
  filterBudgetsByMonth() {
    if (!this.budgetList || !this.selectMonth) {
      this.filteredBudgetList = [];
      return;
    }
    const selectedDate = new Date(this.selectMonth);
    this.filteredBudgetList = this.budgetList.filter((budget) => {
      const date = new Date(budget.date);
      return (
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth());
    }).map((budget) => ({
      ...budget,
      spent: this.calculateSpentAmount(budget.category),
    }));
    this.updateAvailableCategories();
  }
  //edit a categoryBudget
  editCategoryBudget(budget: any) {
    this.showForm = true;
    this.isEditMode = true;
    this.selectedBudgetId = budget._id;
    this.selectedCategoryId = budget.category;
    const date = new Date(budget.date);
    this.selectedDate = date;
    this.selectedCategoryName = this.getCategoryName(budget.category);
    this.addBudgetForm.patchValue({ limit: budget.limit });
  }

  //add new budget for selcetd category
  addCategoryBudget() {
    if (this.addBudgetForm.invalid) {
      this.showError('All Fields are required');
      return;
    }
    const selectedCategoryBudgetData = {
      _id: this.selectedBudgetId,
      categoryId: this.selectedCategoryId,
      ...this.addBudgetForm.value,
      date: this.selectMonth,
    };
    if (this.isEditMode && this.selectedBudgetId) {
      this.budgetService.updateBudget(selectedCategoryBudgetData).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackbar.open('Budget Updated Successfully', 'close', { duration: 3000 });
          this.getAllBudgetList();
          this.resetForm();
        },
        error: (error) => {
          console.log(error);
          this.showError('Update Failed! try again');
        },
      });
    } else {
      this.budgetService.setNewBudget(selectedCategoryBudgetData).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackbar.open('Budget Added Successfully', 'Close', { duration: 3000 });
          this.getAllBudgetList();
          this.resetForm();
        },
        error: (err) => {
          console.error(err);
          this.showError('Failed to set budget');
        },
      });
    }
  }
  //
  openConfirmDialog(id: string): void {
    const dialog= this.dialog.open(ConfirmDialogComponent);
    dialog.afterClosed().subscribe((data) => {
      if (data === true) {
        this.deleteBudget(id);
      }
    });
  }

  //delete Budget from busgetList
  deleteBudget(id: string) {
    this.budgetService.deleteCategorySetBudget(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackbar.open('Budget Removed', 'Close', { duration: 3000 });
        this.budgetList = this.budgetList.filter((selectedBudget) => selectedBudget._id !== id);
        this.filterBudgetsByMonth();
        this.getAllBudgetList()
        this.getAllCategory();
      },
      error: (err) => {
        console.error(err);
        this.showError('Failed to delete budget');
      },
    });
  }

  //find availble expense categories
  getExpenseCategory(): Category[] {
    return this.categoryList.filter((category) => category.type === 'expense');
  }

  updateSelectedMonth(date: Date) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    this.formattedDate = date.toLocaleDateString('en-US', options);
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



  toggleForm(category: Category) {
    this.showForm = !this.showForm;
    this.selectedCategoryId = category._id;
    this.selectedCategoryName = category.name;
  }

  closeForm() {
    this.resetForm();
  }

  resetForm() {
    this.addBudgetForm.reset({ limit: 0 });
    this.showForm = false;
    this.isEditMode = false;
    this.selectedBudgetId = null;
    this.selectedCategoryId = null;
  }

    ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}



  //find total income and total expense used categories
  totalIncome() {
    return this.filteredBudgetList.filter(budgetCategory => {
      const category = this.categoryList.find((category => category._id === budgetCategory.category))
      return category ? category.type : 'income';
    }).reduce((total, budgetCategory) => total + budgetCategory.limit, 0)

  }

  totalExpense() {
    return this.filteredBudgetList.filter(budgetCategory => {
      const category = this.categoryList.find((category => category._id === budgetCategory.category));
      return category ? category.type : 'expense';
    }).reduce((total, budgetCategory) => total + budgetCategory.spent, 0)
  }

  getCategoryName(id: string) {
    const category = this.categoryList.find((category) => category._id === id);
    return category ? category.name : '';
  }


  showError(message: string) {
    this.snackbar.open(message, 'Close', { duration: 3000 });
  }
}








