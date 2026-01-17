import { LogService } from './../../services/log.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Log } from '../../models/log.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-log-activity',
  imports: [CommonModule],
  templateUrl: './log-activity.component.html',
  styleUrl: './log-activity.component.css'
})
export class LogActivityComponent implements OnInit, OnDestroy {
  logList: Log[] = [];

  constructor(private logService: LogService, private snackbar: MatSnackBar) { }
  ngOnInit(): void {
    this.getAllLogs()
    this.groupedLogsByDate()
  }
  private destroy$ = new Subject<void>();


  getAllLogs() {
    this.logService.getAllLogs().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: { data: Log[] }) => {
        this.logList = res?.data?? [];
        this.filteredLoglist = [...this.logList],
          this.groupedLogsByDate();
      },
      error: (err) => {
        console.error('Failed to fetch logs:', err);
        this.snackbar.open('logs not Found', 'close', { duration: 2000 })
      }
    });
  }
  filteredLoglist: Log[] = []
  groupedLogs: { [key: string]: Log[] } = {};
  groupedDates: string[] = [];

  groupedLogsByDate() {
    this.groupedLogs = {};
    this.filteredLoglist.forEach((log: Log) => {
      const dateKey = new Date(log.date).toISOString().slice(0, 10);
      if (!this.groupedLogs[dateKey]) {
        this.groupedLogs[dateKey] = [];
      }
      this.groupedLogs[dateKey].push(log);
    });
    this.groupedDates = Object.keys(this.groupedLogs).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}

