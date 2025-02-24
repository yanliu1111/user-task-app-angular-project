import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Task, TaskPriority, generateTask } from '@take-home/shared';

import Fuse from 'fuse.js';
import { StorageService } from '../storage/storage.service';
import { TasksService } from './tasks.service';
import { TestBed } from '@angular/core/testing';

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve([]);
  }
  getActiveFilter(): keyof Task | null {
    return null;
  }
}

describe('TasksService', () => {
  let service: TasksService;
  let storageService: StorageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TasksService,
        { provide: StorageService, useClass: MockStorageService },
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TasksService);
    storageService = TestBed.inject(StorageService);
  });

  describe('getTasksFromApi', () => {
    it('should send a GET request to /tasks', (done) => {
      service.getTasksFromApi().subscribe(done);
      const endpointUrl = '/api/tasks';
      const req = httpTestingController.expectOne(endpointUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(null);
      httpTestingController.verify();
    });

    it('should return the received data', () => {
      const fakeData = [generateTask(), generateTask()];
      service.getTasksFromApi().subscribe((data) => {
        expect(data).toEqual(fakeData);
      });
      const endpointUrl = '/api/tasks';
      const req = httpTestingController.expectOne(endpointUrl);
      req.flush(fakeData);
    });
  });

  describe('getTasksFromStorage', () => {
    it('should load tasks from storage', async () => {
      jest.spyOn(storageService, 'getTasks').mockResolvedValueOnce([]);
      await service.getTasksFromStorage();
      expect(service.tasks).toEqual([]);
    });

    it('should apply filters after loading tasks', async () => {
      jest.spyOn(storageService, 'getTasks').mockResolvedValueOnce([]);
      jest.spyOn(service, 'applyFilters');
      await service.getTasksFromStorage();
      expect(service.applyFilters).toHaveBeenCalled();
    });
  });

  describe('filterTask', () => {
    beforeEach(() => {
      (service as any).allTasks = [
        generateTask({ isArchived: false, priority: TaskPriority.HIGH, completed: false }),
        generateTask({ isArchived: true, priority: TaskPriority.LOW, completed: true }),
      ];
    });

    it('should filter task by isArchived key', () => {
      service.filterTask('isArchived');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by priority key', () => {
      service.filterTask('priority');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by completed key', () => {
      service.filterTask('completed');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by scheduledDate key', () => {
      const today = new Date().toISOString().split('T')[0];
      (service as any).allTasks = [
        generateTask({ scheduledDate: new Date(today) }),
        generateTask({ scheduledDate: new Date('2023-01-01') }),
      ];
      service.filterTask('scheduledDate');
      expect(service.tasks.length).toEqual(1);
      expect(service.tasks[0].scheduledDate.toISOString().split('T')[0]).toBe(today);
    });
  });

  describe('searchTask', () => {
    beforeEach(() => {
      (service as any).allTasks = [
        generateTask({ title: 'Clean the house', uuid: '1' }),
        generateTask({ title: 'Go to the gym', uuid: '2' }),
        generateTask({ title: 'Buy groceries at home', uuid: '3' }),
      ];
    });

    it('should search task list for title with search term', () => {
      service.searchTask('home');
      const filteredTasks = service.tasks.filter(t => t.uuid !== '1' && t.uuid !== '2');
      expect(filteredTasks.length).toEqual(1);
    });

    it('should reset task list if search term is empty', () => {
      service.searchTask('');
      expect(service.tasks.length).toEqual((service as any).allTasks.length);
    });

    it('should search task list for a fuzzy match on title', () => {
      service.searchTask('hoem'); // Simulate a fuzzy search input
      const filteredTasks = service.tasks.filter(t => t.uuid !== '1' && t.uuid !== '2');
      expect(filteredTasks.length).toBe(1);
      expect(filteredTasks[0].title).toBe('Buy groceries at home');
    });
  });
});
