import { Category } from './../../models/category.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';



@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit, OnDestroy {

  categoryList: Category[] = [];
  categoryType: string[] = ['income', 'expense']
  categoryForm: FormGroup;
  showForm: boolean = false;
  selectedCategoryId: string | null = null;
  isEditCategory: boolean = false;
  private destroy$ = new Subject<void>();

  toggleForm() {
    this.showForm = !this.showForm
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }
  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
     private categoryService: CategoryService,
      private snackbar: MatSnackBar) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],

    })
  }


  ngOnInit(): void {
    this.getAllCategory();
  }

  //getAll Category
  getAllCategory() {
    this.categoryService.getAllCategory().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: Category[] }) => {
        this.categoryList = res?.data ?? [];
      },
      error: (error) => {
        this.showError('Failed to Fatcah categories');
        console.error(error);
      }
    })
  }


  //addnew category
  addCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.snackbar.open('All Fields are Required', 'close', { duration: 3000 })
      return;
    }
    this.categoryService.addCategory(this.categoryForm.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: Category) => {
        this.snackbar.open('Category Add Success', 'close', { duration: 3000 });
        this.getAllCategory();
        this.resetForm();
      },
      error: (error) => {
        console.log(error);
        this.showError('Unable to create category.'
)
      }
    })
  }

  //edit Categroy By CategoryId
  editCategoryById(category: Category) {
    this.showForm = true;
    this.isEditCategory = true;
    this.selectedCategoryId = category._id;
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type
    });
  }

openConfirmDialog(id: string): void {
  const dialog= this.dialog.open(ConfirmDialogComponent);
  dialog.afterClosed().subscribe((data) => {
    if (data === true) {
      this.deleteCategory(id);
    }
  });
}

  //deleteCategory Byid
  deleteCategory(id: string) {
    this.categoryService.deleteCategory(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackbar.open('Category Delete Success', 'close', { duration: 3000 });
        this.categoryList = this.categoryList.filter(category => category._id !== id);
        this.getAllCategory()
      },
      error: (error) => {
        console.log(error);
        this.showError('Failed to Delete Category');
      }
    })
  }

  //updateCategoryByid
  updateCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.snackbar.open('All fields are required', 'close', { duration: 3000 })
      return;
    }
    const categoryUpdateDetails = {
      _id: this.selectedCategoryId,
      ...this.categoryForm.value
    };
    this.categoryService.updateCategory(categoryUpdateDetails).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackbar.open('Category Updated Successfully', 'Close', { duration: 3000 });
        this.getAllCategory();
        this.resetForm();
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to update category.');
      }
    });
  }

  //getincome categories
  getIncomeCategory(): Category[] {
    return this.categoryList.filter(category => category.type === 'income')
  }

  getExpenseCategory(): Category[] {
    return this.categoryList.filter(category => category.type === 'expense')
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  resetForm() {
    this.categoryForm.reset({
      name: '',
      type: ''
    });
    this.showForm = false;
    this.isEditCategory = false;
    this.selectedCategoryId = null;
  }
  get form() {
    return this.categoryForm.controls;
  }

  showError(message: string) {
    this.snackbar.open(message, 'Close', { duration: 2000 });
  }

}
