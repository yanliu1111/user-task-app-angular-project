import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChartComponent } from './chart.compent';
import { Router } from '@angular/router';
import { TasksService } from '../tasks.service';
import { of } from 'rxjs';

jest.mock('@swimlane/ngx-charts', () => ({
  Color: jest.fn(),
  ScaleType: jest.fn()
}));

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(async () => {
    const tasksServiceMock = {
      getUnfilteredTasks: () => Promise.resolve([
        { priority: 'HIGH', completed: true },
        { priority: 'MEDIUM', completed: false },
        { priority: 'LOW', completed: true }
      ])
    };
    const routerMock = {
      navigate: jest.fn() // Replacing Jasmine spy with Jest
    };

    await TestBed.configureTestingModule({
      declarations: [ChartComponent],
      providers: [
        { provide: TasksService, useValue: tasksServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
    }).compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router); // Ensure router is properly assigned
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load chart data on init', async () => {
    await component.ngOnInit();
    await fixture.whenStable(); // Wait for all async tasks to complete
    fixture.detectChanges(); // Ensure updates are reflected in the component
    
    console.log('taskData:', component.taskData);
    console.log('taskCompletionData:', component.taskCompletionData);
  
    expect(component.taskData.length).toBe(3);
    expect(component.taskCompletionData.length).toBe(2);
  });

  it('should navigate back when onBack is called', () => {
    component.onBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
