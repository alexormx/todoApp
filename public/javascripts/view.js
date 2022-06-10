class View {
  constructor() {
    this.selectors = {
      mainTemplate: document.querySelector("#main_template"),
      itemPartial: document.querySelector("#item_partial"),
      listTemplate: document.querySelector("#list_template"),
      allTodosTemplate: document.querySelector("#all_todos_template"),
      completedTodosTemplate: document.querySelector("#completed_todos_template"),
      titleTemplate: document.querySelector("#title_template"), 
      allListTemplate: document.querySelector("#all_list_template"),
      completeListTemplate: document.querySelector("#completed_list_template"),
    }

    this.templates = {
      mainTemplate: Handlebars.compile(this.selectors.mainTemplate.innerHTML),
      itemPartial: Handlebars.compile(this.selectors.itemPartial.innerHTML),
      listTemplate: Handlebars.compile(this.selectors.listTemplate.innerHTML),
      allTodosTemplate: Handlebars.compile(this.selectors.allTodosTemplate.innerHTML),
      completedTodosTemplate: Handlebars.compile(this.selectors.completedTodosTemplate.innerHTML),
      titleTemplate: Handlebars.compile(this.selectors.titleTemplate.innerHTML),
      allListTemplate: Handlebars.compile(this.selectors.allListTemplate.innerHTML),
      completeListTemplate: Handlebars.compile(this.selectors.completeListTemplate.innerHTML)
    }
    
    Handlebars.registerPartial("all_todos_template", this.selectors.allTodosTemplate.innerHTML);
    Handlebars.registerPartial("all_list_template", this.selectors.allListTemplate.innerHTML);
    Handlebars.registerPartial("completed_todos_template", this.selectors.completedTodosTemplate.innerHTML);
    Handlebars.registerPartial("completed_list_template", this.selectors.completeListTemplate.innerHTML);
    Handlebars.registerPartial("title_template", this.selectors.titleTemplate.innerHTML);
    Handlebars.registerPartial("list_template", this.selectors.listTemplate.innerHTML);
    Handlebars.registerPartial("item_partial", this.selectors.itemPartial.innerHTML);

    Handlebars.registerHelper("isTrue", value => value === "true" );
    Handlebars.registerHelper("dueDate", (month, year) => {
      let dueDate = month + "/" + year;
      if(month === "" || year === "") {
        dueDate = "No Due Date";
      }
      return dueDate;
    })

    this.body = document.body;
  }

  displayUI(todos, filtered, done, byDate, doneByDate, selectedData) {
    this.body.innerHTML = ""
    this.body.innerHTML = this.templates.mainTemplate({todos, done, todos_by_date: byDate, done_todos_by_date: doneByDate, selected: filtered, current_section: selectedData});
    document.querySelector("#all_header").classList.add("active");
    this.clickNewTodo()
  }

  clickNewTodo() {
    this.modalLayer = document.querySelector("#modal_layer");
    this.modalForm = document.querySelector("#form_modal");
    document.querySelector("#add_new_item").addEventListener("click", event => {
      this.modalLayer.style.display = "block";
      this.modalForm.style.display = "block";
      this.modalForm.querySelector("form").dataset.type = "new"
    });
    this.modalLayer.addEventListener("click", this.hideModalNew.bind(this));
  }

  bindFormAndModals(handler) {
    this.modalForm = document.querySelector("#form_modal");
    this.modalForm.addEventListener("click", handler); 
  }


  hideModalNew() {
    this.modalLayer.style.display = "none";
    this.modalForm.style.display = "none";
    this.clearForm() 
  }

  bindSelectDateGroups(handler) {
    document.querySelector("#all_lists").addEventListener("click", handler);
  }

  bindSelectAll(handler) {
    document.querySelector("#all_todos").addEventListener("click", handler);
  }

  bindSelectCompletedAll(handler) {
    document.querySelector("#completed_todos").addEventListener("click", handler);
  }

  bindSelectCompletedByGroup(handler) {
    document.querySelector("#completed_lists").addEventListener("click", handler);
  }

  bindDeleteItem(handler) {
    document.querySelector("#todos_selection").addEventListener("click", handler)
  }


  selectActive(node) {
    let dls = document.querySelectorAll("#all_lists > dl")
    dls.forEach(node => {
      node.classList.remove("active");
    });
    let dlsComplete = document.querySelectorAll("#completed_lists > dl")
    dlsComplete.forEach(node => {
      node.classList.remove("active");
    });
    document.querySelector("#all_header").classList.remove("active");
    document.querySelector("#all_done_header").classList.remove("active");
    node.classList.add("active");
  }

  renderFiltered(filteredData) {
    let filtered = this.templates.listTemplate({selected: filteredData.data});
    let title = this.templates.titleTemplate({current_section: filteredData});
    document.querySelector("#todos_selection").innerHTML = filtered
    document.querySelector("#main_title").innerHTML = title;
  }

  renderCompleted(data) {
    let title = this.templates.completedTodosTemplate({done: data});
    document.querySelector("#completed_todos").innerHTML = title;
  }

  renderCompleteByDate(data) {
    let html = this.templates.completeListTemplate({done_todos_by_date: data})
    document.querySelector("#completed_lists").innerHTML = html;
  }

  clearForm() {
    let form = document.querySelector("#form_modal form");
    form.querySelector("#title").value = "";
    form.querySelector("#due_day").value = "";
    form.querySelector("#due_month").value = "";
    form.querySelector("#due_year").value = "";
    form.querySelector("#description").value = "";

  }

  renderCompleteComp(dataComplete, dataCompleteByDate) {
    let completedHtml = this.templates.completedTodosTemplate({done: dataComplete});
    document.querySelector("#completed_todos").innerHTML = completedHtml;

    let completeList = this.templates.completeListTemplate({done_todos_by_date: dataCompleteByDate});
    document.querySelector("#completed_lists").innerHTML = completeList;
  }

  rederAllTodosList(todosByDate, allTodos) {
    let allTodosHtml = this.templates.allListTemplate({todos_by_date: todosByDate});
    document.querySelector("#all_lists").innerHTML = allTodosHtml;

    let titleHtml = this.templates.allTodosTemplate({todos: allTodos});
    document.querySelector("#all_todos").innerHTML = titleHtml;
  }

}

export default new View();