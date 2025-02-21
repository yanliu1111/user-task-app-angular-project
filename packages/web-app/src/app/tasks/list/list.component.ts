import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import { Task } from '@take-home/shared';
import { TasksService } from '../tasks.service';
import { take } from 'rxjs';

@Component({
  selector: 'take-home-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: false,
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    // TODO: mark as completed
    // TODO: save updated task to storage
    item.completed = true;
    this.storageService.updateTaskItem(item).then(() => {
      this.getTaskList();
    });
  }

  onDeleteTask(item: Task): void {
    // TODO: mark as archived
    // TODO: save updated task to storage
    // TODO: refresh list without archived items
    item.isArchived = true;
    this.storageService.updateTaskItem(item).then(() => {
      this.getTaskList();
    });
  }

  onAddTask(): void {
    // TODO: navigate to add task
    this.router.navigate(['/add']);
  }

  private getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }
}
