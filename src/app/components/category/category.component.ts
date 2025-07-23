import { Category } from './../../models/category.model';
import { Component, Input, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  categoryList: Category[] = [];
  categoryType: string[] = ['income', 'expense']
  categoryForm: FormGroup;
  showForm: boolean = false;
  selectedCategoryId: string | null = null;
  isEditCategory: boolean = false;

  toggleForm() {
    this.showForm = !this.showForm
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }
  constructor(private fb: FormBuilder, private categoryService: CategoryService, private snackbar: MatSnackBar) {
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
    this.categoryService.getAllCategory().subscribe({
      next: (res: { data: Category[] }) => {
        this.categoryList = res.data;

      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'Failed to Fatcah categories';
        this.showError(errorMessage);
        console.error(error);
      }
    })
  }



  //addnew category
  addCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.categoryService.addCategory(this.categoryForm.value).subscribe({
      next: (res: Category) => {
        console.log('Category Details: ', res);
        this.snackbar.open('Category Add Success', 'close', { duration: 3000 });
        this.getAllCategory();
        this.resetForm();
      },
      error: (error) => {
        console.log(error);
        this.showError('Create Category Failed.!')
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

  //deleteCategory Byid
  deleteCategory(id: string) {
    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.snackbar.open('Category Delete Success', 'close', { duration: 3000 });
        this.categoryList = this.categoryList.filter(category => category._id !== id);
        this.getAllCategory()
      },
      error: (error) => {
        console.log(error);
        const errorMessage = error?.error?.message || 'Failed to Delete Category';
        this.showError(errorMessage);
      }
    })
  }

  //updateCategoryByid
  updateCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const categoryUpdateDetails = {
      _id: this.selectedCategoryId,
      ...this.categoryForm.value
    };
    this.categoryService.updateCategory(categoryUpdateDetails).subscribe({
      next: () => {
        this.snackbar.open('Category Updated Successfully', 'Close', { duration: 3000 });
        this.getAllCategory();
        this.resetForm();
      },
      error: (error) => {
        console.error(error);
        const errorMessage = error?.error?.message || 'Failed to update category';
        this.showError(errorMessage);
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
