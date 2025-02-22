import { Color, ScaleType } from '@swimlane/ngx-charts';
import { Component, OnInit } from '@angular/core';

import { TasksService } from '../tasks.service';

@Component({
  selector: 'take-home-chart-component',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: false
})
export class ChartComponent implements OnInit {
  taskData: any[] = [];
  view: [number, number] = [700, 400]; // Chart size

  // Chart options
  showLegend = true;
  showLabels = true;
  colorScheme: Color = {
    name: 'priorityScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#f44336', '#ff9800', '#4caf50'] // Red, Orange, Green
  };

  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData(): void {
    const tasks = this.tasksService.tasks.filter(task => !task.isArchived);
    console.log('tasks',tasks)
    // Define priority counts with explicit typing
    const priorityCounts: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
   
    tasks.forEach(task => {
      if (task.priority in priorityCounts) {
        priorityCounts[task.priority as 'HIGH' | 'MEDIUM' | 'LOW']++;
      }
    });

    this.taskData = Object.entries(priorityCounts).map(([priority, value]) => ({
      name: priority,
      value: value
    })); 
    console.log('this.taskData',this.taskData)
  }
}

