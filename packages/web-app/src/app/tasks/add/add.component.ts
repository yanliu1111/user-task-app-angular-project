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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
  ],
})
export class AddComponent {
  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
  });
  protected priorities = Object.values(TaskPriority);

  constructor(private storageService: StorageService, private router: Router) {}

  async onSubmit() {
    if (this.addTaskForm.valid) {
      const newTask: Task = {
        ...this.addTaskForm.getRawValue(),
        uuid: faker.string.uuid(),
        isArchived: false,
        // + 1 day
        // scheduledDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
        scheduledDate: Date.now()
      };

      await this.storageService.addTaskItem(newTask);
      this.router.navigate(['/']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
