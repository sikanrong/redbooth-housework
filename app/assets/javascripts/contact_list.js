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
        email: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip: "",
        extra_notes: ""
    },
    
    setupFileUpload: function(){
        this.trigger("setup:fileupload");
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
  
  initialize: function(){
      this.model.on("setup:fileupload", this.setupFileUpload, this);
  },
  
  templateHelpers:function(){
        var my = this;
        return {
            hasImage: function(){
              var modelAttrs = my.model.attributes;
              
              if(typeof modelAttrs.id == "undefined"){
                    return false;
              }
                
              if(typeof modelAttrs.contact_image_file_name == "undefined"){
                  return false;
              }
              
              if(modelAttrs.contact_image_file_name == null){
                  return false;
              }
              
                return true;
            },
            
            getImageUrl: function(){
                if(typeof my.model.attributes.id == "undefined"){
                    return null;
                }
                
                var zeroPad = function(num, places) {
                   var zero = places - num.toString().length + 1;
                   return Array(+(zero > 0 && zero)).join("0") + num;
                }
                
                var paddedIdStr = zeroPad(my.model.attributes.id, 9);
                var idStrArray = [];
                for(var i = 0; i < 3; i++){
                    idStrArray.push(paddedIdStr.substring(i*3, (i*3)+3));
                }
                var idUrl = idStrArray.join("/");
                return "/system/contacts/contact_images/"+idUrl+"/thumb/"+my.model.attributes.contact_image_file_name;
            }
        };
    },
  
  setupFileUpload: function(){
    var my = this;
    var url = "/contacts/upload_image/"+this.model.id;
    this.$('.fileupload').fileupload({
        url: url,
        dataType: 'json',
        done: function (e, data) {
            console.log("Image uploaded...");
            
            //sync this model from the server, update the view
            my.model.fetch({success: function(){
                my.rerender();        
            }});
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    });
  },
  
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
          email: this.$("#email").val(),
          address_line_1: this.$("#address_line_1").val(),
          address_line_2: this.$("#address_line_2").val(),
          city: this.$("#city").val(),
          state: this.$("#state").val(),
          zip: this.$("#zip").val(),
          extra_notes: this.$("#extra_notes").val()
      });
      
      this.rerender();
  },
  
  rerender: function(){
      this.render();
      this.setupFileUpload();
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
  
  setupFileUpload: function(){
    this.contacts.each(function(contact_model){
        contact_model.setupFileUpload();
    });
  },
  
  reRenderCollection: function(){
    this.listview.render();
    this.setupFileUpload();  
  },
  
  renderCollection: function(){
      
    console.log("Rendering "+this.contacts.length+" Contacts...");
    var my = this;
    
    var addview = new AddContactView({
        model: new ContactModel(),
        el: "#add_new"
    });

    this.listview = new ContactListView({
        collection: this.contacts,
        el: "#contacts_list"
    });
    
    this.list_region = new Backbone.Marionette.Region({
        el: "#list_region"
    });
    
    this.list_region.on("show", function(view){
        my.setupFileUpload();
    });
    
    addview.render();
    this.list_region.show(this.listview);
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
    model.fetch({success: function(){
        $app.contacts.add(model);
        $app.reRenderCollection();
    }});
});

//Start the Marionette app...
$app.start();