import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecordListService } from '../../services/recordList.service';
import { CategoryService } from '../../services/category.service';
import { AccountService } from '../../services/account.service';
import { Color, NgxChartsModule } from '@swimlane/ngx-charts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecordList } from '../../models/recordlist.model';
import { Category } from '../../models/category.model';
import { Account } from '../../models/account.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ScaleType } from '@swimlane/ngx-charts';
import { Subject, takeUntil } from 'rxjs';

interface IncomeExpene {
  category: string;
  amount: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit, OnDestroy {
  recordList: RecordList[] = [];
  categoryList: Category[] = [];
  accountList: Account[] = [];
  filteredRecordList: RecordList[] = [];
  getIncomePercent: IncomeExpene[] = [];
  getExpensePercent: IncomeExpene[] = [];
  accountIncomeExpenseData: any[] = [];
  private destroy$ = new Subject<void>();

  totalIncome = 0;
  totalExpense = 0;
  selectMonth!: string;
  selectMonthLabel!: string;
  activeView: 'income' | 'expense' | 'account' = 'income';

  budgetData: any[] = [];
  view: [number, number] = [window.innerWidth < 700 ? 300 : 600, 400];

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Account';
  yAxisLabel = 'Amount';
  timeline = true;
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#9370DB', '#FF7F50',]
  };




  pieChartData: any[] = []
  showLabels = true
  isDoughnut: boolean = false;

  colorSchemeForPie = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['']
  };

  constructor(
    private recordService: RecordListService,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.selectMonth = today.toISOString().slice(0, 7);
    this.fatchData();
  }


  //fatch all data
  fatchData() {
    this.recordService.getAllRecord().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: RecordList[] }) => {
        this.recordList = res?.data ?? [];
        this.accountService.getAllAccount().pipe(takeUntil(this.destroy$)).subscribe({
          next: (res: { data: Account[] }) => {
            this.accountList = res?.data ?? [];
            this.categoryService.getAllCategory().pipe(takeUntil(this.destroy$)).subscribe({
              next: (res: { data: Category[] }) => {
                this.categoryList = res?.data ?? [];
                this.onMonthChange();
              },
              error: (error) => {
                console.log(error);
                this.showError('Failed to Fatch Categories')
              }
            });
          },
          error: (error) => {
            console.log(error);
            this.showError('Failed to Fatch Accounts ')
          }
        });
      },
      error: (error) => {
        console.log(error);
        this.showError('Failed to Fatch Transaction Records')
      }
    });
  }

  //show errormessage
  showError(message: string) {
    this.snackbar.open(message, 'Close', { duration: 2000 });
  }

  onMonthChange(): void {
    const selected = new Date(this.selectMonth);
    this.selectMonthLabel = selected.toISOString().slice(0, 7);
    this.filteredRecordList = this.recordList.filter(record =>
      new Date(record.date).toISOString().slice(0, 7) === this.selectMonth
    );
    this.calculateIncome();
    this.calculateExpense();
    if (this.activeView === 'account') {
      this.updateChartData();
    }
    this.updatePieChartData()
  }


  updatePieChartData() {
    const transactionData = this.activeView === 'income' ? this.getIncomePercent : this.getExpensePercent;
    this.pieChartData = transactionData.map(transactionRecord => ({
      name: transactionRecord.category,
      value: transactionRecord.amount
    }));
    const colors = this.generateColors(transactionData.length)
    this.colorSchemeForPie = {
      name: 'custom',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: colors,
    };
  }

  //calculate income
  calculateIncome() {
    const income = this.filteredRecordList.filter(transactionRecord => transactionRecord.type === 'income' && transactionRecord.category !== null && transactionRecord.category !== undefined);
    this.totalIncome = income.reduce((total, transactionRecord) => total + +transactionRecord.amount, 0);
    const grouped: { [key: string]: number } = {};
    income.forEach(record => {
      const categoryName = this.getCategoryName(record.category);
      const amount = Number(record.amount);
      if (!grouped[categoryName]) {
        grouped[categoryName] = 0;
      }
      grouped[categoryName] += amount;
    });
    const colors = this.generateColors(Object.keys(grouped).length);
    this.getIncomePercent = Object.entries(grouped).map(([category, amount], i) => ({
      category,
      amount,
      percent: +(amount / this.totalIncome * 100).toFixed(1),
      color: colors[i]
    }));

  }

  //calculate expense from trasaction
  calculateExpense() {
    const expense = this.filteredRecordList.filter(transactionRecord => transactionRecord.type === 'expense');
    this.totalExpense = expense.reduce((total, record) => total + +record.amount, 0);
    const grouped: { [key: string]: number } = {};

    expense.forEach(expenseTransaction => {
      const categoryName = this.getCategoryName(expenseTransaction.category);
      const amount = Number(expenseTransaction.amount);
      if (!grouped[categoryName]) {
        grouped[categoryName] = 0;
      }
      grouped[categoryName] += amount
    })
    const categories = Object.keys(grouped);
    const colors = this.generateColors(categories.length);
    this.getExpensePercent = Object.entries(grouped).map(([category, amount], i) => ({
      category,
      amount,
      percent: +(amount / this.totalExpense * 100).toFixed(1),
      color: colors[i]
    }));
  }

  //uodate data in cart
  updateChartData(): void {
    const income = new Map<string, number>();
    const expense = new Map<string, number>();
    this.accountList.forEach(account => {
      income.set(account._id, 0);
      expense.set(account._id, 0);
    });
    this.filteredRecordList.forEach(transactionRecord => {
      const amount = +transactionRecord.amount;
      if (transactionRecord.type === 'income') {
        income.set(transactionRecord.account, income.get(transactionRecord.account)! + amount);
      } else {
        expense.set(transactionRecord.account, expense.get(transactionRecord.account)! + amount);
      }
    });
    this.budgetData = this.accountList.map(account => ({
      name: account.name,
      series: [
        { name: 'Income', value: income.get(account._id) || 0 },
        { name: 'Expense', value: expense.get(account._id) || 0 }
      ]
    })).filter(x => x.series.some(y => y.value > 0));
    this.accountIncomeExpenseData = this.accountList.map(account => ({
      accountName: account.name,
      income: income.get(account._id) || 0,
      expense: expense.get(account._id) || 0,
    })).filter(record => record.income > 0 || record.expense > 0);
  }

  onSelect(event: any): void {
    console.log('Chart item selected:', event);
  }

  getCategoryName(id: string): string {
    return this.categoryList.find(category => category._id === id)?.name || 'Unknown';
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  showChart(view: 'income' | 'expense' | 'account') {
    this.activeView = view;
    if (view === 'account') {
      this.updateChartData();
    } else {
      this.updatePieChartData();
    }
  }
  //generate random colors
  generateColors(count: number): string[] {
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.floor((360 / count) * i);
      colors.push(`hsl(${hue}, 65%, 50%)`);
    }
    return colors;
  }

}

