/* 
 * Alex Pilafian, 2014-11-18
 * Written for RedBooth.com application process.
 */

//Define the contact model
//Link to the RESTful rails API for 'contacts'
var ContactModel = Backbone.Model.extend({
    urlRoot: '/contacts',
    defaults: {
        full_name: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip: "",
        extra_notes: ""
    }
});

//define the contact collection. 
var ContactCollection = Backbone.Collection.extend({
    url: "/contacts",
    model: ContactModel
});

var SingleContactView = Backbone.Marionette.ItemView.extend({
  tagName: "div",
  className: "display_mode",
  
  template: "#contact_template",
  
  events: {
    "click a.destroy" : "clear",
    "click a.toggle_edit" : "toggleEditMode",
    "click input.save" : "toggleEditMode"
  },
  
  toggleEditMode: function(){
    if(this.$el.hasClass("display_mode")){
      this.$el.removeClass("display_mode");
      this.$el.addClass("edit_mode");
    }else{
      this.$el.addClass("display_mode");
      this.$el.removeClass("edit_mode");
      this.saveContact();
    }
  },
  
  saveContact: function(){
      this.model.save({
          full_name: this.$("#full_name").val(),
          address_line_1: this.$("#address_line_1").val(),
          address_line_2: this.$("#address_line_2").val(),
          city: this.$("#city").val(),
          state: this.$("#state").val(),
          zip: this.$("#zip").val(),
          extra_notes: this.$("#extra_notes").val()
      });
      
      this.render();
  },
  
  clear: function(){
    this.model.destroy();
  }
  
});

var AddContactView = SingleContactView.extend({
    tagName: "div",
    template: "#contact_template",
    
    events: {
        "click input.add" : "addContact"
    },
    
    addContact: function(){
        this.saveContact();
        $app.commands.execute("listAggregate", this.model);
        this.model = new ContactModel();
        this.render();
    }
    
});

var EmptyView = Backbone.Marionette.ItemView.extend({
  template: "#empty_template"
});

var ContactListView = Backbone.Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: SingleContactView,
  emptyView: EmptyView
});

//Define the main Marionette application class.
var ContactsApp = Marionette.Application.extend({
  initialize: function(options) {
    console.log("Init marionette application...");
    var my = this;
    
    //define a member variable "contacts" to hold the contacts collection within 
    //the main application object...
    this.contacts = new ContactCollection();
    
    
  },
  
  fetchData: function(afterSuccess){
    this.contacts.fetch({
      success: function (contacts) {
          console.log("Fetched "+contacts.length+" Contacts.");
          afterSuccess(contacts);
      }
    });
  },
  
  renderCollection: function(){
      
    console.log("Rendering "+this.contacts.length+" Contacts...");
      
    var addview = new AddContactView({
        model: new ContactModel(),
        el: "#add_new"
    });

    this.listview = new ContactListView({
        collection: this.contacts,
        el: "#contacts_list"
    });

    addview.render();
    this.listview.render();
  },
  
  onStart: function(options){
    var my = this;
    
    my.fetchData(function(){
        my.renderCollection();
    });
  }
  
});

//initialize the global marionette application object
var $app = new ContactsApp({container: '#contacts_list'});

$app.commands.setHandler("listAggregate", function(model){
    $app.contacts.add(model);
    $app.listview.render();
});

//Start the Marionette app...
$app.start();