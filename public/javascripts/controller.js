import model from "./model.js";
import view from "./view.js";

class Controller {
  constructor() {
    this.noDataOption = "No Due Date";
    this.filteredTodos = null;
    this.self = this;
    this.monthYearOptions = null;
    this.selectedMonthYear = null;
    this.completed = null;
    this.completedByMonthYear = null;
    this.filteredData = {};
    this.state = {title: "All Todos", complete: false}

    this.refreshTodos();
    
  }

  bindListeners() {
    view.bindSelectDateGroups(this.handleClickDateGroup.bind(this.self));
    view.bindSelectAll(this.handleClickAll.bind(this.self));
    view.bindSelectCompletedAll(this.handleClickAllCompelted.bind(this.self));
    view.bindSelectCompletedByGroup(this.handleClickCompltedByGroup.bind(this.self));
    view.bindFormAndModals(this.handleButtonsActions.bind(this.self));
    view.bindDeleteItem(this.handleButtonTodo.bind(this.self));
  }

  async refreshTodos() {
    model.todos = await model.getAllTodos();
    
    this.filteredData.title = this.state.title;
    this.filteredData.data = model.todos;
    this.resetSelect();
    this.monthYearOptions = this.generateMonthYear();
    this.completed = this.filterCompleted();
    this.completedByMonthYear = this.filterCompletesByMonthYear();
    this.renderPage();
    this.bindListeners();
  }

  async refreshData() {
    model.todos = await model.getAllTodos();
    
    this.filteredData.title = this.state.title;
    this.filteredData.data = model.todos;
    this.resetSelect();
    this.monthYearOptions = this.generateMonthYear();
    this.completed = this.filterCompleted();
    this.completedByMonthYear = this.filterCompletesByMonthYear();
  }

  renderPage() {
    view.displayUI(model.todos, this.filteredTodos, this.completed, this.monthYearOptions, this.completedByMonthYear, this.filteredData);
  }

  resetSelect() {
    this.selectedMonthYear = null;
    this.filteredTodos = model.todos
  }

  renderSideBar() {
    this.view.displayAllItemsSide(this.monthYearOptions);
  }

  generateMonthYear() {
    let years = [...new Set(model.todos.map(el => el.year))].sort();
    let yearMonth = {};
    years.forEach(year => {
      let todosPerYear = model.todos.filter(ele => ele.year === year);
      yearMonth[year] = [];
      todosPerYear.forEach(todo => {
        if(!yearMonth[year].includes(todo.month)) {
          yearMonth[year].push(todo.month);
        }
      })
    });

    return this.getMonthYearArray(yearMonth);
  }

  getMonthYearArray(yearMonth) {
    let options = {};
    Object.keys(yearMonth).forEach(year => {
      yearMonth[year].sort();
      if(year === "") {
        options[this.noDataOption] = this.filterByMonthYear("", "");
        return;
      };
      yearMonth[year].forEach(month => {
        if(month === "" ) {
          return;
        }
        let joinDate = month + "/" + year;
        options[joinDate] = this.filterByMonthYear(month, year);
      });
    });
    return options;
  }

  countMonthYear(option) {
    let monthYear = ["", ""];
    if(option !== this.noDataOption) {
      monthYear = option.split("/")
    }

    return this.filterByMonthYear(...monthYear).length;
  }

  filterByMonthYear(month, year) {
    if(month === "" || year === "") {
      return model.todos.filter(ele => {
        return ele.year === "" || ele.month === "";
      });
    } else {
      return model.todos.filter(ele => {
        return ele.year === year && ele.month === month;
      })
    }
  }

  filterCompleted() {
    return model.todos.filter(element => {
      return element.completed;
    });
  }

  filterCompletesByMonthYear() {
    let completed = {}
    Object.keys(this.monthYearOptions).forEach(key => {
      let filtered = this.monthYearOptions[key].filter(element => {
        return element.completed;
      })
      if(filtered.length > 0) {
        completed[key] = filtered;
      }
    });
    return completed;
  }

  handleClickDateGroup(event) {
    let currentNode = event.target;
    while(currentNode.tagName !== "DL") {    
      currentNode = currentNode.parentNode;
    }
    this.state.title = currentNode.dataset.title;
    this.state.complete = false;

    view.selectActive(currentNode);
    this.filteredData.title = currentNode.dataset.title;
    this.filteredData.data = this.monthYearOptions[currentNode.dataset.title];
    view.renderFiltered(this.filteredData);
  }

  handleClickAll(event) {
    let currentNode = event.currentTarget;
    view.selectActive(currentNode);

    this.state.title = "All Todos";
    this.state.complete = false;

    this.filteredData.title = "All Todos";
    this.filteredData.data = model.todos;
    view.renderFiltered(this.filteredData);
  }

  handleClickAllCompelted(event) {
    let currentNode = event.currentTarget;
    view.selectActive(currentNode);

    this.state.title = "Completed";
    this.state.complete = true;

    this.filteredData.title = "Completed";
    this.filteredData.data = this.completed;
    view.renderFiltered(this.filteredData);
  }

  handleClickCompltedByGroup(event) {
    let currentNode = event.target;
    while(currentNode.tagName !== "DL") {    
      currentNode = currentNode.parentNode;
    }

    this.state.title = currentNode.dataset.title;
    this.state.complete = true;

    view.selectActive(currentNode);
    this.filteredData.title = currentNode.dataset.title;
    this.filteredData.data = this.completedByMonthYear[currentNode.dataset.title];
    view.renderFiltered(this.filteredData);
  }

  handleButtonsActions(event) {
    event.preventDefault();
    let buttonId = event.target.id;
    let form = document.querySelector("#form_modal form")
    let action = form.dataset.type;
    let id = form.dataset.id;
    if(buttonId === "submit_button") {
      let object = this.getFormData(form);
      if(object.title.length < 3) {
        alert("You must enter a title at least 3 characters long.")
        return
      }
      let json = JSON.stringify(object);
      if(action === "edit") {
      model.editTodos(id, json, this.hideModal.bind(this));
      } else {
      model.addTodos(json, this.hideModal.bind(this));
      }

    } else if(buttonId === "mark_complete") {
      if(action === "edit") {
        this.markDone(id);
        view.clearForm();
      } else {
        alert("Cannot mark as complete as item has not been created yet!");
      }
    }

  }

  getFormData(form) {
    let object = {}
    object.title = form.querySelector("#title").value;
    object.day = form.querySelector("#due_day").value;
    object.month = form.querySelector("#due_month").value;
    object.year = form.querySelector("#due_year").value;
    object.description = form.querySelector("#description").value;
    return object;
  }

  async hideModal() {
    await this.refreshData()
    view.hideModalNew();
    this.renderSelection()
    view.clearForm();
    view.renderCompleteComp(this.completed, this.completedByMonthYear);
    view.rederAllTodosList(this.monthYearOptions);
  }

  renderSelection() {
    let data = {title: this.state.title};
    if(this.state.complete) {
      if(this.state.title === "Complete") {
        data.data = this.completed;
      } else {
        data.data = this.completedByMonthYear[data.title];
      }
    }else {
      if(this.state.title === "All Todos") {
        data.data = model.todos;
      } else {
        data.data = this.monthYearOptions[data.title];
      }
    }
    view.renderFiltered(data);
  }

  async handleButtonTodo(event) {
    event.preventDefault();
    let node = event.target
    if(node.tagName === "IMG") {
      node = node.parentNode;
    }
    if(node.classList.contains("delete")) {
      let id = node.parentNode.dataset.id;
      this.deleteItem(id);
    } else if(node.classList.contains("list_item") || node.tagName === "SPAN") {
      let id;
      if(node.tagName === "SPAN") {
        id = node.previousElementSibling.id.replace("item_", "");
      } else {
        id = node.firstElementChild.id.replace("item_", "");
      }
      this.toggleDone(id);

    } else if(node.tagName === "LABEL") {
      let id = node.previousElementSibling.previousElementSibling.id.replace("item_", "");
      let itemToUpdate = await model.getTodo(id);
      let form = document.querySelector("#form_modal form")

      form.querySelector("#title").value = itemToUpdate.title;
      form.querySelector("#due_day").value = itemToUpdate.day;
      form.querySelector("#due_month").value = itemToUpdate.month;
      form.querySelector("#due_year").value = itemToUpdate.year;
      form.querySelector("#description").value = itemToUpdate.description;

      view.modalLayer.style.display = "block";
      view.modalForm.style.display = "block";

      form.dataset.type = "edit";
      form.dataset.id = id;
    }
  }

  underLine(id) {
    let node = document.querySelector(`#todos_selection tr[data-id="${id}"] input`);
    node.checked = !node.checked;
    this.updateCompleted();  
  }

  underLineComplete(id) {
    let node = document.querySelector(`#todos_selection tr[data-id="${id}"] input`);
    node.checked = true; 
    this.updateCompleted();  
  }

  async toggleDone(id) {
    let itemToUpdate = await model.getTodo(id);
    itemToUpdate.completed = !itemToUpdate.completed;
    let json = JSON.stringify(itemToUpdate);
    model.editTodos(id, json, this.underLine.bind(this));  
  }

  
  async markDone(id) {
    let itemToUpdate = await model.getTodo(id);
    itemToUpdate.completed = true;
    let json = JSON.stringify(itemToUpdate);
    model.editTodos(id, json, this.underLineComplete.bind(this));
    view.modalLayer.style.display = "none";
    view.modalForm.style.display = "none";
  }

  async deleteItem(id) {
    let item = await model.deleteTodo(id) 
    let currentTitle = document.querySelector("#current_title time").textContent;
    await this.refreshTodos();
    if(currentTitle !== "All Todos") {
      let node = document.querySelector(`article dl[data-title="${currentTitle}"]`);
      view.selectActive(node);
      this.filteredData.title = currentTitle;
      this.filteredData.data = this.monthYearOptions[currentTitle];
      view.renderFiltered(this.filteredData);
    }
  }

  async updateCompleted() {
    model.todos =  await model.getAllTodos();
    this.completed = this.filterCompleted();
    this.monthYearOptions = this.generateMonthYear();
    this.completedByMonthYear = this.filterCompletesByMonthYear();
    view.renderCompleteComp(this.completed, this.completedByMonthYear);
  }

}

document.addEventListener("DOMContentLoaded", () => {
  const app = new Controller();
});
