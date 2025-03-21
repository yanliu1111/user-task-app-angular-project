import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Task, TaskPriority } from '@take-home/shared';

import { CommonModule } from '@angular/common'; // Import CommonModule
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'take-home-add-component',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule to imports
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class AddComponent {
  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      validators: [
        Validators.required,
        alphanumericLengthValidator(10), 
      ],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
    scheduledDate: new FormControl(new Date(), {
      validators: [Validators.required],
    }),
  });
  protected priorities = Object.values(TaskPriority);
  protected minDate: Date = new Date(); // Today
  protected maxDate: Date = new Date(new Date().setDate(new Date().getDate() + 7)); // Next 7 days
  constructor(private storageService: StorageService, private router: Router) {}
  get getMinDate(): Date {
    return this.minDate;
  }

  get getMaxDate(): Date {
    return this.maxDate;
  }
  async onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask: Task = {
        ...this.addTaskForm.getRawValue(),
        uuid: faker.string.uuid(),
        isArchived: false,
        // + 1 day
        // scheduledDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
        scheduledDate: this.addTaskForm.get('scheduledDate')!.value,
      };

      await this.storageService.addTaskItem(newTask);
      this.router.navigate(['/']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
  get titleControl() {
    return this.addTaskForm.get('title');
  }
}

function alphanumericLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // Allow empty input to be handled by 'required' validator
    const filteredLength = (control.value.match(/[a-zA-Z0-9]/g) || []).length; // Count only a-z, A-Z, 0-9
    return filteredLength >= minLength ? null : { alphanumericMinLength: { requiredLength: minLength, actualLength: filteredLength } };
  };
}