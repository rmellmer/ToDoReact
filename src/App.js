import React, { Component } from 'react';
// import 'muicss/dist/css/mui.css';
import './App.css'
import styled from 'styled-components';
import FlipMove from 'react-flip-move';

const SubmitButton = styled.button`
    background:#1AAB8A;
    color:#fff;
    border:none;
    position:relative;
    font-size:1em;
    height: 40px;
    margin: 10px;
    cursor:pointer;
    transition:800ms ease all;
    outline:none;
  
    :hover{
      background:#fff;
      color:#1AAB8A;
    }

    :before,:after{
      content:'';
      position:absolute;
      top:0;
      right:0;
      height:2px;
      width:0;
      background: #1AAB8A;
      transition:400ms ease all;
    }
    :after{
      right:inherit;
      top:inherit;
      left:0;
      bottom:0;
    }
    :hover:before,:hover:after{
      width:100%;
      transition:800ms ease all;
    }
`

const RemoveButton = styled.button`
    background:#d11a2a;
    color:#fff;
    border:none;
    position:relative;
    font-size:1em;
    height: 30px;
    margin: 10px;
    cursor:pointer;
    transition:800ms ease all;
    outline:none;
  
    :hover{
      background:#fff;
      color:#d11a2a;
    }

    :before,:after{
      content:'';
      position:absolute;
      top:0;
      right:0;
      height:2px;
      width:0;
      background: #d11a2a;
      transition:400ms ease all;
    }
    :after{
      right:inherit;
      top:inherit;
      left:0;
      bottom:0;
    }
    :hover:before,:hover:after{
      width:100%;
      transition:800ms ease all;
    }
`

const StyledItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-weight: 800;
`

class ToDo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      linkClasses: "remove-todo"
    }
  }

  handleMouseEnter = (event) => {
    this.setState({ linkClasses: "remove-todo-show" });
  }

  handleMouseLeave = (event) => {
    this.setState({ linkClasses: "remove-todo" });
  }

  render() {
    return (
      <StyledItem onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <h1>{this.props.message}</h1>
        <RemoveButton onClick={() => this.props.delete(this.props.todoId)} className={this.state.linkClasses}>Remove</RemoveButton>
      </StyledItem>
    );
  }
}

class ToDoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      error: null,
      isLoaded: false,
      todos: [],
      updating: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteToDo = this.deleteToDo.bind(this);
  }

  handleChange = (event) => {
    this.setState({
      message: event.target.value
    });
  };

  handleSubmit(event) {
    var object = { message: this.state.message };
    var json = JSON.stringify(object);

    fetch('/api/todo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: json
    });
    event.preventDefault();
    this.setState({ message: '' });
    this.getItems();
  }

  componentDidMount() {
    this.getItems();
    this.timer = setInterval(()=> this.getItems(), 1000);
  }
  
  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  getItems() {
    fetch("/api/todos")
      .then(res => res.json())
      .then(
        (result) => {
          if (result.success === true && this.state.updating === false) {
            this.setState({
              isLoaded: true,
              todos: result.todos
            });
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          if (this.state.isLoaded === false) {
            this.setState({
              isLoaded: false,
              error: "Whoops! Can't pull todos from database! *DEVELOPER CRIES* :'("
            });
          }
        }
      );
  }

  deleteToDo = (key) => {
    this.setState({
      updating: true
    });

    var filtered = this.state.todos.filter(function(item) {
      return (item.todoId !== key);
    });
   
    this.setState({
      todos: filtered
    });

    fetch('/api/todo?id=' + key, {
      method: 'DELETE'
    }).then((res) => {
      this.setState({
        updating:false
      });
    });
  };

  render() {
    if (this.state.error) {
      return <div>{this.state.error}</div>;
    } 
    else if (!this.state.isLoaded) {
      return <div>Loading...</div>;
    }
    else {
      return (
        <div style={{position: 'relative'}}>
          <FlipMove duration={250} easing="ease-out">
            {this.state.todos.map(todo => (
              <ToDo key={todo.todoId} todoId={todo.todoId} message={todo.message} delete={this.deleteToDo}/>
            ))}
            <form onSubmit={this.handleSubmit} style={{ textAlign: 'center'}}>
              <input type="text" id="input" class="Input-text" placeholder="e.g. Eat a Taco" value={this.state.message} onChange={this.handleChange}/>
              <SubmitButton type="submit">Add To Do</SubmitButton>
            </form>
          </FlipMove>
        </div> 
      );
    }
  }
}


class App extends Component {
  render() {
    return (
        <ToDoList />
    );
  }
}

export default App;
