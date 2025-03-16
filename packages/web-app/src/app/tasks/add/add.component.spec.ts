import { BrowserModule, By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddComponent } from './add.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';
import { Task } from '@take-home/shared';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve([]);
  }
  getActiveFilter(): keyof Task | null {
    return null;
  }
  addTaskItem(): Promise<void> {  // Add this
    return Promise.resolve();
  }
}

describe('AddComponent', () => {
  let fixture: ComponentFixture<AddComponent>;
  let loader: HarnessLoader;
  let component: AddComponent;
  let storageService: StorageService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        AddComponent       
      ],
      declarations: [],
      providers: [{ provide: StorageService, useClass: MockStorageService }],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    storageService = TestBed.inject(StorageService);
    fixture = TestBed.createComponent(AddComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Add Task');
  });
// add date picker test
  it('should prevent selecting a date before minDate', async () => {
    const dateInput = await loader.getHarness(MatDatepickerInputHarness);
    const invalidDate = new Date();
    invalidDate.setDate(component.getMinDate.getDate() - 1);

    await dateInput.setValue(invalidDate.toISOString());
    fixture.detectChanges();

    expect(component['addTaskForm'].controls['scheduledDate'].valid).toBeFalsy();
  });

  it('should prevent selecting a date after maxDate', async () => {
    const dateInput = await loader.getHarness(MatDatepickerInputHarness);
    const invalidDate = new Date();
    expect(component['addTaskForm'].controls['scheduledDate'].valid).toBeTruthy();

    invalidDate.setDate(component.getMaxDate.getDate() + 1);

    await dateInput.setValue(invalidDate.toISOString());
    fixture.detectChanges();

    expect(component['addTaskForm'].controls['scheduledDate'].valid).toBeFalsy();
  });
// date picker test end

it(`should navigate to home when cancel button is clicked`, async () => {
  jest.spyOn(router, 'navigate').mockResolvedValue(true);
  jest.spyOn(component, 'onCancel');

  const cancelButton = await loader.getHarness(
    MatButtonHarness.with({ selector: '[data-testid="cancel"]' })
  );
  await cancelButton.click();
  await fixture.detectChanges();

  expect(component.onCancel).toHaveBeenCalledTimes(1);
  expect(router.navigate).toHaveBeenCalledWith(['/']);
});


  it(`should prevent adding task without a valid title`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    expect(await addButton.isDisabled()).toBeTruthy();
    component['addTaskForm'].controls['title'].setValue('Invalid');
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();
    component['addTaskForm'].controls['title'].setValue(
      'This is a valid title',
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeFalsy();
  });

  it(`should create a new task for a valid submission and navigate home`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'addTaskItem').mockResolvedValue(); 

    component['addTaskForm'].controls['title'].setValue('Adding a test task');
    component['addTaskForm'].controls['description'].setValue(
      'This task should be added to the list'
    );

    fixture.detectChanges();

    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' })
    );
    await addButton.click();
    fixture.detectChanges();

    expect(component.onSubmit).toHaveBeenCalledTimes(1);
    expect(storageService.addTaskItem).toHaveBeenCalledTimes(1);
    expect(storageService.addTaskItem).toHaveBeenCalledWith(
      expect.objectContaining({
        isArchived: false,
        title: 'Adding a test task',
        description: 'This task should be added to the list',
      })
    );
    expect(router.navigate).toHaveBeenCalledWith(['/']); 
});

  
});
