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
  taskCompletionData: any[] = [];
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
  pieColorScheme: Color = {
    name: 'completionScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4caf50', '#f44336'] // Green for Completed, Red for Incomplete
  };
  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    this.loadChartData();
    this.loadCompletionChartData();
  }

  async loadChartData(): Promise<void> {
    const tasks = await this.tasksService.getUnfilteredTasks(); // Get all non-archived tasks
    //console.log("tasks",tasks)
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
    //console.log("this.taskData",this.taskData)
  }

  async loadCompletionChartData(): Promise<void> {
    const tasks = await this.tasksService.getUnfilteredTasks();
  
    const completedCount = tasks.filter(task => task.completed).length;
    const incompleteCount = tasks.length - completedCount;
    const totalTasks = tasks.length;
  
    this.taskCompletionData = [
      { name: `Completed (${((completedCount / totalTasks) * 100).toFixed(1)}%)`, value: completedCount },
      { name: `Incomplete (${((incompleteCount / totalTasks) * 100).toFixed(1)}%)`, value: incompleteCount }
    ];
  }
}

