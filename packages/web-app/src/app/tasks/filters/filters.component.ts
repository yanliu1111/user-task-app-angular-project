import { Component } from '@angular/core';
import { MatChipSelectionChange } from '@angular/material/chips';
import { Task } from '@take-home/shared';
import { TasksService } from '../tasks.service';

@Component({
    selector: 'take-home-filters-component',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    standalone: false
})
export class FiltersComponent {
  selectedFilter: keyof Task | null = null;
  constructor(protected tasksService: TasksService) {
    this.selectedFilter = this.tasksService.getActiveFilter(); // debug: Restore selected filter
  }

  filterTask(field: keyof Task, event: MatChipSelectionChange) {
    if (event.selected) {
      this.selectedFilter = field;
      this.tasksService.filterTask(field);
    } else {
      this.selectedFilter = null;
      this.tasksService.clearFilters();
    }
  }
}
