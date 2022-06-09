class Model {
  constructor() {
    this.todos = null;
  }
  
  getAllTodos() {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open("GET", "/api/todos");
      request.responseType = 'json';
      request.addEventListener('load', () => {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject({
            status: request.status,
            statusText: request.statusText,
          });
        }
      });
          
      request.send();
    })
  }

  getTodo(id) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open("GET", `/api/todos/${id}`);
      request.responseType = 'json';

      request.addEventListener('load', () => {
        if (request.status === 200) {
          resolve(request.response)
        } else {
          reject({
            status: request.status,
            statusText: request.statusText,
          });
        }
      });
          
      request.send();
    });
  }

  addTodos(todoData, handler) {
    let request = new XMLHttpRequest();
    request.open("POST", "/api/todos/");
    request.setRequestHeader("Content-Type", "application/json")

    request.addEventListener("load", () => {
      if (request.status === 201) {
        handler()
      } else {
        alert("The todo could not be added! \n" + request.response);
      }
    });

    request.send(todoData);
  }

  editTodos(id, todoData, handler) {
    let request = new XMLHttpRequest();
    request.open("PUT", `/api/todos/${id}`);
    request.setRequestHeader("Content-Type", "application/json");

    request.addEventListener("load", () => {
      if (request.status === 200) {
        handler(id)
      } else {
        alert("The todo could not be edited! \n" + request.response);
        }
    });

    request.send(todoData);
  }

  deleteTodo(id) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open("DELETE", `/api/todos/${id}`)
      request.addEventListener("load", () => {
        if (request.status === 204) {
          resolve(request.response);
        }
      });

      request.send();
    });
  }
}

export default new Model();