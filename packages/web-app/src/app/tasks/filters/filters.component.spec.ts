import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersComponent } from './filters.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatChipOptionHarness } from '@angular/material/chips/testing';
import { MatChipsModule } from '@angular/material/chips';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Task } from '@take-home/shared';
import { TasksService } from '../tasks.service';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { of } from 'rxjs';

class MockTasksService {
  filterTask = jest.fn();
  getTasksFromStorage = jest.fn().mockResolvedValue([]);
  
  getActiveFilter(): keyof Task | null {
    return null;
  }
}

describe('FiltersComponent', () => {
  let fixture: ComponentFixture<FiltersComponent>;
  let loader: HarnessLoader;
  let mockTasksService: MockTasksService;
  let component: FiltersComponent;

  beforeEach(async () => {
    mockTasksService = new MockTasksService();

    await TestBed.configureTestingModule({
      declarations: [FiltersComponent],
      imports: [MatChipsModule, NoopAnimationsModule], // Required for Material Chips
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture); // Initialize loader for harness
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain 3 mat chips for filtering', async () => {
    const matChips = await loader.getAllHarnesses(MatChipOptionHarness);
    expect(matChips.length).toEqual(3);
    expect(await matChips[0].getText()).toEqual('High Priority');
    expect(await matChips[1].getText()).toEqual('Not Complete');
    expect(await matChips[2].getText()).toEqual('Due Today');
  });
  it('should filter tasks by priority', async () => {
    const spy = jest.spyOn(mockTasksService, 'filterTask');
    const matChips = await loader.getAllHarnesses(MatChipOptionHarness);
    await matChips[0].select();

    expect(spy).toHaveBeenCalledWith('priority'); // Removed `expect.any(Object)`
  });

  it('should filter tasks by completed', async () => {
    const spy = jest.spyOn(mockTasksService, 'filterTask');
    const matChips = await loader.getAllHarnesses(MatChipOptionHarness);
    await matChips[1].select();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('completed'); // Removed `expect.any(Object)`
  });

  it('should filter tasks by scheduledDate', async () => {
    const spy = jest.spyOn(mockTasksService, 'filterTask');
    const matChips = await loader.getAllHarnesses(MatChipOptionHarness);
    await matChips[2].select();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('scheduledDate'); // Removed `expect.any(Object)`
  });

});
