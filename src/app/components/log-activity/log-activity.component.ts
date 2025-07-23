import { LogService } from './../../services/log.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'
import { Log } from '../../models/log.model';

@Component({
  selector: 'app-log-activity',
  imports: [CommonModule],
  templateUrl: './log-activity.component.html',
  styleUrl: './log-activity.component.css'
})
export class LogActivityComponent implements OnInit {
  logList: Log[] = [];

  constructor(private logService: LogService, private snackbar: MatSnackBar) { }
  ngOnInit(): void {
    this.getAllLogs()
    this.groupedLogsByDate()
  }


  //fatch all logs 
  getAllLogs() {
    this.logService.getAllLogs().subscribe({
      next: (res: { data: Log[] }) => {
        this.logList = res.data;
        this.filteredLoglist = [...this.logList],
          this.groupedLogsByDate();
      },
      error: (err) => {
        console.error('Failed to fetch logs:', err);
        const errorMessage = err?.error?.messgae || 'logs not Found..'
        this.snackbar.open(errorMessage, 'close', { duration: 2000 })
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

    for (const dateKey in this.groupedLogs) {
      this.groupedLogs[dateKey].sort((x, y) => {
        return new Date(y.date).getTime() - new Date(x.date).getTime();
      });
    }
    // Sort dates descending
    this.groupedDates = Object.keys(this.groupedLogs).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }


}

