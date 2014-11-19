/* 
 * Alex Pilafian, 2014-11-18
 * Written for RedBooth.com application process.
 */

//Define the contact model
//Link to the RESTful rails API for 'contacts'
var ContactModel = Backbone.Model.extend({
    urlRoot: '/contacts'
});

//define the contact collection. 
var ContactCollection = Backbone.Collection.extend({
    url: "/contacts",
    model: ContactModel
});

var SingleContactView = Backbone.Marionette.ItemView.extend({
  tagName: "li",
  template: "#contact_template"
});

var ContactListView = Backbone.Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: SingleContactView
});

//Define the main Marionette application class.
var ContactsApp = Marionette.Application.extend({
  initialize: function(options) {
    console.log("Init marionette application...");
    
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
      var my = this;
      console.log("Rendering "+this.contacts.length+" Contacts...");
      
      listview = new ContactListView({
          collection: my.contacts,
          el: "#contacts_list"
      });
      
      listview.render();
  },
  
  onStart: function(options){
    var my = this;
    my.fetchData(function(){
        my.renderCollection();
    });
  }
  
});

//initialize the global marionette application object
var $app = new ContactsApp({container: '#main_container'});

//Start the Marionette app...
$app.start();