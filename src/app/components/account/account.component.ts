import { Component, OnInit } from '@angular/core';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar'
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordListService } from '../../services/recordList.service';
import { RecordList } from '../../models/recordlist.model';


@Component({
  selector: 'app-account',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})

export class AccountComponent implements OnInit {
  accountList: Account[] = [];
  recordList: RecordList[] = []
  addAccountForm: FormGroup;
  transactionForm: FormGroup;
  showForm: boolean = false;
  transferForm: boolean = false;
  selectedAccountId: string | null = null;
  isEditAccount: boolean = false;
  accountId!: string;
  recordId!: string


  constructor(private fb: FormBuilder,
    private accountService: AccountService,
    private recordService: RecordListService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router) {
    this.addAccountForm = this.fb.group({
      name: ['', [Validators.required]],
      amount: [0, [Validators.required]]
    }),
      this.transactionForm = fb.group({
        fromAccountId: ['', [Validators.required]],
        toAccountId: ['', Validators.required],
        amount: [null, Validators.required]
      })
  }


  ngOnInit(): void {
    this.accountService.getAllAccount().subscribe({
      next: (res: { data: Account[] }) => {
        this.accountList = res.data;
        this.route.queryParams.subscribe(params => {
          this.accountId = params['accountId'];
          this.recordId = params['recordId'];
          if (this.accountId && this.recordId) {
            const account = this.accountList.find(acc => acc._id === this.accountId);
            if (account) {
              this.showForm = true;
              this.isEditAccount = true;
              this.addAccountForm.patchValue({
                name: account.name,
                amount: account.amount
              });
            } else {
              this.showError('Account Not Found for Edit');
            }
          }
          //Edit transfer tRansaction record
          if (this.recordId && !this.accountId) {
            this.recordService.getRecordById(this.recordId).subscribe({
              next: (res: any) => {
                const record = res.data;
                if (record && record.isTransfer && record.type === 'transfer') {
                  this.transferForm = true;
                  this.transactionForm.patchValue({
                    fromAccountId: record.fromAccount,
                    toAccountId: record.toAccount,
                    amount: record.amount
                  });
                }
              },
              error: (error) => {
                const errorMessage = error?.error?.message || 'Failed To Fetch Transfer Record';
                this.snackbar.open(errorMessage, 'close', { duration: 3000 });
              }
            });
          }
        });
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to fetch account');
      }
    });
  }


  //fatch all accounts
  getAllAccount() {
    this.accountService.getAllAccount().subscribe({
      next: (res: { data: Account[] }) => {
        this.accountList = res.data;
      },
      error: (error) => {
        console.error(error);
        this.showError('Failed to Fatch Accounts...');
      }
    });
  }

  //crete New account
  addNewAccount() {
    if (this.addAccountForm.invalid) {
      this.addAccountForm.markAllAsTouched();
      return;
    }
    this.accountService.addAccount(this.addAccountForm.value).subscribe({
      next: () => {
        this.snackbar.open('Account Created SuccessFully.!', 'close', { duration: 3000 })
        this.resetForm();
        this.getAllAccount();
      },
      error: (error) => {
        console.log(error);
        this.showError('Add Account Failed! please try again')
      }
    })
  }


  //delete Accounts
  deleteAccount(id: string) {
    this.accountService.deleteAccount(id).subscribe({
      next: () => {
        this.snackbar.open('Account deleted SuccessFully.!', 'close', { duration: 3000 });
        this.accountList = this.accountList.filter(account => account._id !== id);
        this.getAllAccount();
      },
      error: (error) => {
        console.error(error);
        this.showError('Delete Failed.! Try Again');
      }
    })
  }


  //transfer amount
  amountTransfer() {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return
    }
    const TransferAmountDetails = {
      ...this.transactionForm.value,
      recordId: this.recordId
    }

    if (this.recordId) {
      this.accountService.updateTransferAmount(TransferAmountDetails).subscribe({
        next: () => {
          this.snackbar.open('Transfer Amount Details Updated SuccessFully.!', 'close', { duration: 3000 });
          this.resetForm();
          this.router.navigate([], { queryParams: {} })
        },
        error: (error) => {
          console.log(error);
          this.showError('Failed To Update Transfer Record');
        }
      })
    }
    //used for transfer amount
    else {
      this.accountService.amountTransfer(this.transactionForm.value).subscribe({
        next: () => {
          this.snackbar.open('Amount Transfer Success', 'close', { duration: 3000 });
          this.getAllAccount();
          this.resetForm()

        },
        error: (error) => {
          console.log(error);
          this.showError('Failed Amount Transfer')
        }
      })

    }

  }


  //edit account
  editAccount(account: any): void {
    this.accountId = account._id;
    this.recordId = account.recordId;
    this.isEditAccount = true;
    this.showForm = true;
    this.addAccountForm.patchValue({
      name: account.name,
      amount: account.amount,
    });
  }


  //updated account Created with initial amount
  updateAccount() {
    if (this.addAccountForm.invalid) {
      this.showError('All  fields are required')
      return
    }
    const accountUpdateDetails = {
      accountId: this.accountId,
      recordId: this.recordId,
      name: this.addAccountForm.value.name,
      amount: this.addAccountForm.value.amount
    };
    this.accountService.updateAccount(accountUpdateDetails).subscribe({
      next: () => {
        this.snackbar.open('Account or Transaction updated successfully', 'Close', { duration: 3000 });
        this.resetForm();
        this.getAllAccount();
      },
      error: (error) => {
        console.error(error);
        this.showError('Update Failed! Try Again')
      }
    });
  }


  showError(message: string) {
    this.snackbar.open(message, 'Close', { duration: 2000 });
  }


  toggleForm() {
    this.showForm = !this.showForm
  }

  amountTransferForm() {
    this.transferForm = !this.transferForm
  }

  closeForm() {
    this.router.navigate([], { queryParams: {} })
    this.showForm = false;
    this.transferForm = false;
    this.resetForm();
  }
  resetForm() {
    this.addAccountForm.reset();
    this.showForm = false;
    this.isEditAccount = false;
    this.selectedAccountId = null;
    this.transactionForm.reset();
    this.transferForm = false;

  }

  get form() {
    return this.addAccountForm.controls;
  }



}
