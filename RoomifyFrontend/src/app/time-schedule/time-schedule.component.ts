import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulePeriod } from '../models/schedule-period';

@Component({
  selector: 'app-time-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-schedule.component.html',
  styleUrls: ['./time-schedule.component.css']
})
export class TimeScheduleComponent implements OnInit {
  schedulePeriods: SchedulePeriod[] = [];
  hasTimeConflict: boolean = false;
  currentEditPeriod: SchedulePeriod | null = null;
  showModal: boolean = false;

  constructor() { 
    console.log('TimeScheduleComponent constructor called');
  }

  ngOnInit(): void {
    console.log('TimeScheduleComponent initialized');
    this.initializeSchedule();
  }

  initializeSchedule(): void {
    this.schedulePeriods = [
      new SchedulePeriod(0, '1', '08:00', '08:50', '1st Class'),
      new SchedulePeriod(1, '2', '09:00', '10:50', '2nd Class'),
      new SchedulePeriod(2, '3', '10:00', '10:50', '3rd Class'),
      new SchedulePeriod(3, '4', '11:00', '11:50', '4th Class'),
      new SchedulePeriod(4, 'LUNCH', '11:50', '12:20', 'LUNCH'),
      new SchedulePeriod(5, '5', '12:20', '13:10', '5th Class'),
      new SchedulePeriod(6, '6', '13:20', '14:10', '6th Class'),
      new SchedulePeriod(7, '7', '14:20', '15:10', '7th Class')
    ];
    console.log('Schedule initialized with', this.schedulePeriods.length, 'periods');
  }

  onTimeFocus(period: SchedulePeriod): void {
    period.setOriginalStartTime(period.getStartTime());
    period.setOriginalEndTime(period.getEndTime());
  }

  validateTimeRange(period: SchedulePeriod): void {
    const start = this.timeToMinutes(period.getStartTime());
    const end = this.timeToMinutes(period.getEndTime());

    if (start >= end) {
      period.setStartTime(period.getOriginalStartTime() || period.getStartTime());
      period.setEndTime(period.getOriginalEndTime() || period.getEndTime());
      alert('End time must be after start time.');
      return;
    }

    this.checkForTimeConflicts();
  }

  checkForTimeConflicts(): void {
    this.hasTimeConflict = false;
    for (let i = 0; i < this.schedulePeriods.length; i++) {
      const period1 = this.schedulePeriods[i];
      const start1 = this.timeToMinutes(period1.getStartTime());
      const end1 = this.timeToMinutes(period1.getEndTime());
      
      for (let j = i + 1; j < this.schedulePeriods.length; j++) {
        const period2 = this.schedulePeriods[j];
        const start2 = this.timeToMinutes(period2.getStartTime());
        const end2 = this.timeToMinutes(period2.getEndTime());
        
        if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
          this.hasTimeConflict = true;
          return;
        }
      }
    }
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  addPeriod(): void {
    let lastEndTime = '15:20';
    if (this.schedulePeriods.length > 0) {
      lastEndTime = this.schedulePeriods[this.schedulePeriods.length - 1].getEndTime();
    }
    
    const lastEndMinutes = this.timeToMinutes(lastEndTime);
    const newEndMinutes = lastEndMinutes + 50;
    const newEndHours = Math.floor(newEndMinutes / 60);
    const newEndMins = newEndMinutes % 60;
    const newEndTime = `${newEndHours.toString().padStart(2, '0')}:${newEndMins.toString().padStart(2, '0')}`;
    
    const newId = this.schedulePeriods.length > 0 ? Math.max(...this.schedulePeriods.map(p => p.getId())) + 1 : 1;
    
    const newPeriod = new SchedulePeriod(newId, `${newId}`, lastEndTime, newEndTime, 'New Subject');
    
    this.schedulePeriods.push(newPeriod);
    this.checkForTimeConflicts();
  }

  editPeriod(period: SchedulePeriod): void {
    this.currentEditPeriod = new SchedulePeriod(period.getId(), period.getPeriodName(), period.getStartTime(), period.getEndTime(), period.getSubject());
    this.showModal = true;
  }

  savePeriodEdit(): void {
    if (!this.currentEditPeriod) return;
    
    const index = this.schedulePeriods.findIndex(p => p.getId() === this.currentEditPeriod!.getId());
    if (index !== -1) {
      this.schedulePeriods[index] = new SchedulePeriod(
        this.currentEditPeriod.getId(),
        this.currentEditPeriod.getPeriodName(),
        this.currentEditPeriod.getStartTime(),
        this.currentEditPeriod.getEndTime(),
        this.currentEditPeriod.getSubject()
      );
      this.checkForTimeConflicts();
    }
    
    this.closeModal();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentEditPeriod = null;
  }

  saveSchedule(): void {
    if (this.hasTimeConflict) {
      if (!confirm('There are time conflicts in your schedule. Do you still want to save?')) {
        return;
      }
    }
    console.log('Saving schedule:', this.schedulePeriods);
    alert('Schedule saved successfully!');
  }

  resetSchedule(): void {
    if (confirm('Are you sure you want to reset the schedule? All changes will be lost.')) {
      this.initializeSchedule();
      this.hasTimeConflict = false;
    }
  }
}
