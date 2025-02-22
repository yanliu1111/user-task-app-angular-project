import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { Task } from '@take-home/shared';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private allTasks: Task[] = []; // Store all tasks
  tasks: Task[] = [];
  private activeFilter: keyof Task | null = null;
  private searchQuery = ''; 

  
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
    this.allTasks = allFetchedTasks.filter((task) => !task.isArchived);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filteredTasks = [...this.allTasks];

    if (this.activeFilter) {
      switch (this.activeFilter) {
        case 'isArchived':
          filteredTasks = filteredTasks.filter((task) => !task.isArchived);
          break;
        case 'priority':
          filteredTasks = filteredTasks.filter((task) => task.priority === 'HIGH');
          break;
        case 'scheduledDate': {
          const today = new Date().toISOString().split('T')[0];
          filteredTasks = filteredTasks.filter((task) => {
            const taskDate = new Date(task.scheduledDate).toISOString().split('T')[0];
            return taskDate === today;
          });
          break;
        }
        case 'completed':
          filteredTasks = filteredTasks.filter((task) => !task.completed);
          break;
      }
    }

    if (this.searchQuery) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.tasks = filteredTasks;
  }

  filterTask(key: keyof Task): void {
    this.activeFilter = key;
    this.applyFilters();
  }

  searchTask(search: string): void {
    this.searchQuery = search;
    this.applyFilters();
  }

  clearFilters(): void {
    this.activeFilter = null;
    this.applyFilters();
  }
}
