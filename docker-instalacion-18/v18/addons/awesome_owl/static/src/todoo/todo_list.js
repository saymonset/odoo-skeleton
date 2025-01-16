/** @odoo-module **/

import { Component, useState, onMounted, useRef } from "@odoo/owl";
import { TodoItem } from './todo_item';
import { useAutofocus } from "../utils"; 
export class TodoList extends Component {
  static template = "awesome_owl.TodoList";
  static components = { TodoItem };
 

  setup() {
   
    this.todos = [{ id: 2, description: "write tutorial", isCompleted: true },
    { id: 3, description: "buyy milk", isCompleted: false }];

    this.state = useState({ todos: this.todos });  
 
   this.nextId =4;

   useAutofocus("input");

    // in TodoList
    onMounted(() => {
      console.log("TodoList component mounted");
    
     // this.state.todos = this.todos;
      // Aquí podrías cargar datos desde una API o realizar otras inicializaciones
    });
  }

  toggleTodo(todoId) {
    const todo = this.state.todos.find((todo)=> todo.id === todoId);
    if (todo){
      todo.isCompleted = !todo.isCompleted;
    }
  }
  removeTodo(todoId) {
    const todoIndedx = this.state.todos.findIndex((todo)=> todo.id === todoId);
    if (todoIndedx>=0){
      this.state.todos.splice(todoIndedx,1)
    }
  }
  addTodo(ev) {
    if (ev.keyCode === 13 && ev.target.value != "") {
      this.state.todos.push({
        id: this.nextId++,
        description: ev.target.value,
        isCompleted: false
      })
      ev.target.value = "";
    }
  }
 
}
