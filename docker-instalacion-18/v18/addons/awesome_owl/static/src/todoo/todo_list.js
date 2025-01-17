/** @odoo-module **/
import { useTodoStore } from "./todo_store";
import { Component, useState, onMounted, useRef } from "@odoo/owl";
import { TodoItem } from './todo_item';
import { useAutofocus } from "../utils"; 
export class TodoList extends Component {
  static template = "awesome_owl.TodoList";
  static components = { TodoItem };
  static props = { list: Object };
 

  setup() {
   this.store = useTodoStore();
   useAutofocus("input");

    // in TodoList
    onMounted(() => {
      console.log("TodoList component mounted 0");
      console.log(this.props.list.todos);
      console.log("TodoList component mounted 1");
    });
  }



  addTodo(ev) {
    if (ev.keyCode === 13 && ev.target.value != "") {
      console.log('------0----------------')
      console.log(this.props.list.id)
      console.log( ev.target.value)
      this.store.addTodo(this.props.list.id, ev.target.value);
      console.log('------1----------------')
      ev.target.value = "";
    }
  }
 
}
