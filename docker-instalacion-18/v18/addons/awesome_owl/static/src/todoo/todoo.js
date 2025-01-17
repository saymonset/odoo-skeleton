/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { TodoList } from "./todo_list";
import { useTodoStore } from "./todo_store";
import { Layout } from "../layout";
export class Todoo extends Component {
  static template = "awesome_owl.Todoo";
  static components = { TodoList, Layout };
  

  setup() {
    // this.nextId = 1;
    // this.lists= useState([]);
    this.store = useTodoStore();
  
  }

  addNewList() {
    // const id = this.nextId++;
    // this.lists.push({ id, name:`List ${id}`});
    this.store.createList();

  }
}
