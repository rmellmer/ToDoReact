import React, { Component } from 'react';
import styled from 'styled-components';
import FlipMove from 'react-flip-move';

const StyledList = styled.ul`
  list-style: none;
  text-align: center;
  display: block;
  text-decoration: none;
  color: #aaa;
  font-weight: 800;
  text-transform: uppercase;
`

const StyledItem = styled.li`
  position:relative;
  z-index: 1;

  ::before {
    transition: all .5s;
  }
  :hover {
    color: #555;
  }

  ::after {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    width: 100%;
    height: 1px;
    content: '.';
    color: transparent;
    background: rgb(33, 145, 117);
    visibility: none;
    opacity: 0;
    z-index: -1;
  }
`


class ToDo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      linkClasses: "inline remove-todo"
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
        <div>
          <label>{this.props.message}</label>
          <a type="button" onClick={() => this.props.delete(this.props.todoId)}>REMOVE</a>
        </div>
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
        <StyledList>
          <FlipMove duration={250} easing="ease-out">
            {this.state.todos.map(todo => (
              <ToDo key={todo.todoId} todoId={todo.todoId} message={todo.message} delete={this.deleteToDo}/>
            ))}
          </FlipMove>
          <form onSubmit={this.handleSubmit}>
            <input id="message" name="message" type="text" value={this.state.message} onChange={this.handleChange}/>
            <button type="submit">Add ToDo</button>
          </form>
        </StyledList>
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
