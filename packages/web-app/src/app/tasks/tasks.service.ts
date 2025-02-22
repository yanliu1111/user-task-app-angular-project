import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { Task } from '@take-home/shared';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private allTasks: Task[] = []; // Store all tasks
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {
    this.getTasksFromStorage();
  }

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    const allFetchedTasks = await this.storageService.getTasks();
    this.allTasks = allFetchedTasks.filter((task) => !task.isArchived); // Exclude archived tasks
    this.tasks = [...this.allTasks]; // Copy the full task list for display
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        this.tasks = this.tasks.filter((task) => task.priority === 'HIGH');
        break;
      case 'scheduledDate': {
        const today = new Date().toISOString().split('T')[0]; // Get today's date as YYYY-MM-DD
        this.tasks = this.tasks.filter((task) => {
          const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0];
          return taskDate === today;
        });
        break;
      }
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
        break;
    }
  }

  searchTask(search: string): void {
    this.tasks = this.allTasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    );
  }
}
