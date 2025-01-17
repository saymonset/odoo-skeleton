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
   
  //   this.todos = [{ id: 2, description: "write tutorial", isCompleted: true },
  //   { id: 3, description: "buyy milk", isCompleted: false }];

  //   this.state = useState({ todos: this.todos });  

  //  // if (this.){}
 
  //  this.nextId =4;
   this.store = useTodoStore();
   useAutofocus("input");

    // in TodoList
    onMounted(() => {
      console.log("TodoList component mounted 0");
      console.log(this.props.list.todos);
      // if (this.props.list.todos){
      //   console.log("TodoList component mounted 9 ");
      //     this.state.todos = [...this.state.todos, ...this.props.list.todos];
      //     console.log(this.state.todos)
      // }
      console.log("TodoList component mounted 1");
    
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
      console.log('------0----------------')
      console.log(this.props.list.id)
      console.log( ev.target.value)
      this.store.addTodo(this.props.list.id, ev.target.value);
      console.log('------1----------------')
      

      // this.state.todos.push({
      //   id: this.nextId++,
      //   description: ev.target.value,
      //   isCompleted: false
      // })
      ev.target.value = "";
    }
  }
 
}
