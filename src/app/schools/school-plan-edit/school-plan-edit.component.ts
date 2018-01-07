import { EditGuard } from './../../auth/edit-guard.service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { SchoolService } from './../../shared/school.service';
import { TimeService } from './../../shared/time.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { SchoolPlan } from '../../shared/schoolplan.model';

@Component({
  selector: 'app-school-plan-edit',
  templateUrl: './school-plan-edit.component.html',
  styleUrls: ['./school-plan-edit.component.css']
})
export class SchoolPlanEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') planForm: NgForm
  schoolPlan: SchoolPlan;
  datesList = [];
  schoolName: string;
  year: number;
  month: number;
  time: string;
  weekend = false;
  theDay: string;
  daySubscription: Subscription;

  constructor(private timeService: TimeService,
              private schoolService: SchoolService,
              private route: ActivatedRoute,
              private router: Router,
              private editGuard: EditGuard) { }

  ngOnInit() {
    this.schoolName = this.schoolService.selectedSchool;
    this.year = this.timeService.selectedYear;
    this.month = this.timeService.selectedMonth;
    const date = this.timeService.selectedDate;
    this.schoolPlan = this.schoolService.getSchoolPlanUsingName(this.schoolName, 
      this.year, this.month, date);
    this.theDay = this.schoolPlan.day;
    this.time = this.schoolPlan.time;
  
    const lastDate = this.timeService.getLastDate(this.year, this.month);
    for (let i = 1; i <= lastDate; i++){
      this.datesList.push(i);
    }

    this.daySubscription = this.timeService.dayChanged.subscribe(
      (date: number) => {
        let newDay = this.getTheDay(date);
        this.theDay = newDay;
      }
    )
  }

  ngOnDestroy(){
    this.daySubscription.unsubscribe();
    this.editGuard.canEdit = false;
  }

  onSave(){
    const form = this.planForm.value;
    if(confirm('Are you sure you want to save the edited changes?')){
      let time: string;
      let newSchoolPlan = new SchoolPlan(this.schoolPlan.name, 
        this.year, this.month, this.schoolPlan.date, this.theDay, form.period1, form.period2,
        form.period3, form.period4, form.period5, form.period6, form.class1, form.class2, 
        form.class3, form.class4, form.class5, form.class6, form.teacher1, form.teacher2, 
        form.teacher3, form.teacher4, form.teacher5, form.teacher6, form.lesson1, form.lesson2, 
        form.lesson3, form.lesson4, form.lesson5, form.lesson6, form.lunch, form.classLunch,
        form.teacherLunch);
      this.schoolService.editSchoolPlan(this.schoolPlan, newSchoolPlan);
      this.router.navigate(['./../'], {relativeTo: this.route});
    }
    else{
      return;
    }
  }

  onDelete(){
    if(confirm('Are you sure you want to delete this school plan?')){
      this.schoolService.addToApprovalList('delete', this.schoolPlan.time, this.schoolPlan);
      this.router.navigate(['./../'], {relativeTo: this.route});
    }
    else{
      return;
    }
  }

  onChangeDate(){
    this.weekend = this.timeService.isWeekend(this.year, this.month-1, 
                               this.planForm.value.date);
    this.timeService.dayChanged.next(this.planForm.value.date);
  }

  getTheDay(date: number){
    return this.timeService.getDay(this.year, this.month-1, date);
  }


}