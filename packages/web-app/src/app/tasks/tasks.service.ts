import Fuse from 'fuse.js';
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
  public searchQuery = ''; 
  private fuse: Fuse<Task> | null = null;
  
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
  // add fuse.js in
  async getTasksFromStorage(): Promise<void> {
    const allFetchedTasks = await this.storageService.getTasks();
    this.allTasks = allFetchedTasks.filter((task) => !task.isArchived);
    this.fuse = new Fuse(this.allTasks, {
      keys: ['title'],
      threshold: 0.3,
    });
    this.applyFilters();
  }
  //result for chart
  async getUnfilteredTasks(): Promise<Task[]> {
    const allFetchedTasks = await this.storageService.getTasks();
    return allFetchedTasks.filter(task => !task.isArchived); // Exclude archived tasks
  }
  // compile the logic filter and search
  public applyFilters(): void {
    // eslint-disable-next-line no-debugger
    //debugger;
    let filteredTasks = [...this.allTasks];

    if (this.searchQuery && this.fuse) {
      filteredTasks = this.fuse.search(this.searchQuery).map(result => result.item);
    }

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
    
    // if (this.searchQuery) {
    //   filteredTasks = filteredTasks.filter((task) =>
    //     task.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    //   );
    // }
    filteredTasks.sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
    this.tasks = filteredTasks;
  }

  filterTask(key: keyof Task): void {
    this.activeFilter = key;
    this.applyFilters();
  }

  getActiveFilter(): keyof Task | null {
    return this.activeFilter; // debug Provide filter state for UI
  }

  searchTask(search: string): void {
    this.searchQuery = search;
    this.applyFilters();
  }

  clearFilters(): void {
    this.activeFilter = null;
    this.applyFilters();
  }
  getAllTasks(): Task[] {
    return this.allTasks;
  }
}
