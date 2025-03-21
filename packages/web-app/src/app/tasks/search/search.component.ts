import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { Component } from '@angular/core';
import { TasksService } from '../tasks.service';

@Component({
    selector: 'take-home-search-component',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: false
})
export class SearchComponent {
  searchForm: FormGroup;

  constructor(private taskService: TasksService) {
    this.searchForm = new FormGroup({
      search: new FormControl(this.taskService.searchQuery), 
    });

    this.searchForm.controls['search'].valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue) => {
        this.taskService.searchTask(searchValue);
      });
  }

  get tasks() {
    return this.taskService.tasks;
  }
}
