import { Observable, from } from 'rxjs';

import { Injectable } from '@angular/core';
import { Task } from '@take-home/shared';
import { openDB } from 'idb';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'take-home';
  private dbVersion = 1;
  private tasks = 'tasks';

  constructor() {
    this.restoreIndexedDB();
    // this.resetIndexedDB();
  }

  // Create / Update
  async addTaskItem(item: Task) {
    await this.addTask(item);
  }

  async updateTaskItem(item: Task) {
    await this.updateTask(item);
  }

  // Read
  async getTask(id: string | null): Promise<Task> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.get(`${this.tasks}`, id ? id : '');
    });
  }

  async getTasks(): Promise<Task[]> {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.getAll(`${this.tasks}`);
    });
  }
  //debug add promise
  // async getItem<T>(
  //   storeName: string,
  //   id: string | null,
  // ): Promise<Observable<T>> {
  //   const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
  //   return from(
  //     dbPromise.then((db) => {
  //       return db.get(storeName, id ? id : '');
  //     }),
  //   );
  // }

  // async getItems<T>(storeName: string): Promise<T[]> {
  //   const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
  //   return dbPromise.then((db) => {
  //     return db.getAll(storeName);
  //   });
  // }

  // async resetIndexedDB() {
  //   const tasks = this.clearTasks();
  //   await Promise.allSettled([tasks]).then(() => {
  //     this.restoreIndexedDB();
  //   });
  // }

  private async addTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.add(this.tasks, item, item.uuid);
    });
  }

  private async updateTask(item: Task) {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.put(this.tasks, item, item.uuid);
    });
  }

  private async clearTasks() {
    const dbPromise = openDB(`${this.dbName}`, this.dbVersion);
    return dbPromise.then((db) => {
      return db.clear(`${this.tasks}`);
    });
  }

  private restoreIndexedDB(tasks = `${this.tasks}`) {
    openDB(`${this.dbName}`, this.dbVersion, {
      upgrade(db) {
        db.createObjectStore(tasks).createIndex('uuid', 'uuid', {
          unique: true,
        });
      },
    });
  }
}

