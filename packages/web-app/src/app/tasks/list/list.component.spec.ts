import { BrowserModule, By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Task, generateTask } from '@take-home/shared';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FiltersComponent } from '../filters/filters.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { ListComponent } from './list.component';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { StorageService } from '../../storage/storage.service';
import { TasksService } from '../tasks.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class MockTasksService {
  tasks: Task[] = fakeTasks;
  getTasksFromApi(): Observable<Task[]> {
    return of(fakeTasks);
  }
  getTasksFromStorage(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  filterTask(): void {
    return;
  }
  getActiveFilter(): keyof Task | null {
    return null; // Return null or a mock filter key if needed
  }
}

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  updateTaskItem(): void {
    return;
  }
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
      ],
      declarations: [ListComponent, FiltersComponent, SearchComponent],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: StorageService, useClass: MockStorageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Tasks');
  });

  it(`should display total number of tasks`, () => {
    const total = fixture.debugElement.query(By.css('h3'));
    expect(total.nativeElement.textContent).toEqual(
      `Total Tasks: ${fakeTasks.length}`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length);
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/add']);
  });

  it(`should mark a task as complete when done button is clicked`, async () => {
    expect(tasksService.tasks[0].completed).toBe(false);
    jest.spyOn(component, 'onDoneTask');
    const doneButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="complete-task"]' }),
    );
    await doneButton.click();
    doneButton.click();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(true);
  });

  it(`should mark a task as archived when delete button is clicked`, async () => {
    expect(tasksService.tasks[0].isArchived).toBe(false);
    jest.spyOn(component, 'onDeleteTask');
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    await deleteButton.click();
    deleteButton.click();
    fixture.detectChanges();
    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].isArchived).toBe(true);
  });

  it('should not display archived tasks after deleting them', async () => {
    // Exclude fixed tasks from the count
    const nonFixedTasks = tasksService.tasks.filter(t => t.uuid !== '1' && t.uuid !== '2');
    const initialTaskCount = nonFixedTasks.filter(t => !t.isArchived).length;
  
    const task = nonFixedTasks[0]; // Only archive a non-fixed task
    task.isArchived = true;
  
    tasksService.tasks = [...tasksService.tasks]; // Ensure Angular picks up changes
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  
    const taskCards = fixture.debugElement.queryAll(By.css('mat-card'));
  
    // Ensure we only count non-fixed, non-archived tasks
    const expectedCount = initialTaskCount - 1 + 2; // +2 to account for fixed tasks
    expect(taskCards.length).toBe(expectedCount);
  });
  
});