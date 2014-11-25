/* 
 * Alex Pilafian, 2014-11-18
 * Written for RedBooth.com application process.
 */


// A simple global object to hold global data.
$GLOBALS = {
    
    // A simple hash with the 50 US states. 
    // (plus all of the "Associated States" like Guam, the Federated States of Micronesia, etc)
    us_states: {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    }
}

//*********************************************
// MODEL DEFINITIONS
//*********************************************

//Define the contact model
//Link to the RESTful rails API for 'contacts'
var ContactModel = Backbone.Model.extend({
    urlRoot: '/contacts',
    
    // These are the default values for an empty "ContactModel" instance. These
    // are utilized when creating a model to be used with the "Add Contact" form.
    defaults: {
        full_name: "",
        email: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        extra_notes: ""
    }

});

//define the RESTful contact collection. 
var ContactCollection = Backbone.Collection.extend({
    url: "/contacts",
    model: ContactModel
});

//*********************************************
// VIEWS DEFINITIONS
//*********************************************

// This is the most central view of this application: the "Contact Card" view.
// Essentially, this is the view which displays a single Contact model, and the
// interface to edit the data of that model.. 
var ContactCardView = Backbone.Marionette.ItemView.extend({
  tagName: "div",
  id: "single_contact_display",
  
  //Related to the "active state" of this ContactCard.
  selectedOffset: "5px",
  isActive: false,
  
  initialize: function(){
      var my = this;
      
      //This block is also related to the ActiveState of this Contact Card
      //attaches an event to the main HTML object that will call this view's 
      //setInactive method if somewhere other than $el has been clicked.
      $('html').mousedown(function(event) {
        if (!$(event.target).closest(my.$el).length) {
            my.setInactive();
        };
      });
  },
  
  //returns the underscore template object (used to override the render function)
  template : function() {
    return _.template($("#contact_template").html());
  },
  
  //These are extra which are callable from the view. They deal with 
  //image-attachment related stuff.
  templateHelpers:function(){
    var my = this;
    return {
        
        // Returns true if this model has an image attached. False if not.
        hasImage: function(){
          var modelAttrs = my.model.attributes;
          
          //safety check: ensure this model already exists in the backend database.
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

        // This function is used to reconstruct paperclip gem's the image 
        // attachment URL on the client. Seemed to be the easiest way to get
        // the image's URL on the client. 
        // 
        // Also, it's really easy in that the image URI only depends on the model's ID.
        getImageUrl: function(){
            if(typeof my.model.attributes.id == "undefined"){
                return null;
            }

            var zeroPad = function(num, places) {
               var zero = places - num.toString().length + 1;
               return Array(+(zero > 0 && zero)).join("0") + num;
            }
            
            // Note - desired Image URI looks like:
            // /system/contacts/contact_images/000/012/345/thumb/filename.ext
            // --------------------------------|XXX/XXX/XXX| <- this part is just 
            // the model ID, padded by zeroes such that it's 9 digits.
            var paddedIdStr = zeroPad(my.model.attributes.id, 9);
            var idStrArray = [];
            for(var i = 0; i < 3; i++){
                idStrArray.push(paddedIdStr.substring(i*3, (i*3)+3));
            }
            var idUrl = idStrArray.join("/");
            return "/system/contacts/contact_images/"+idUrl+"/thumb/"+my.model.attributes.contact_image_file_name;
        }
  }},
  
  //Overrides the render for Backbone.View so that I can call setupJQueryPlugins() after render.
  render: function(){
      
    // Preparing the variables to be passed to the template, extended by the templateHelpers functions
    var templateVars = _.extend(_.clone(this.model.attributes), this.templateHelpers());
    
    // Actually renders the compiled template with correct data.
    this.$el.html(this.template()(templateVars));
    
    // Called after render: sets up 3rd-party JQuery plugins that are active within this View
    // (such as: jquery.fileupload and jquery.jeditable)
    this.setupJQueryPlugins();
    return this;
  },
  
  events: {
    // mousedown event will trigger the setActive function when this 
    // "Contact Card" is clicked
    "mousedown" : "setActive",
    
    "click a.destroy_contact" : "clear",
    "click a.destroy_image" : "destroyImage"
  },
  
  
  // This pair of functions sets the "active" state for this Contact Card view. 
  // Makes a simple "Sliding out to the left" animation, which leaves a drop-
  // shadow. It's like the card pops off the page when in the "active" state.
  setActive: function(){
      if(this.isActive){
          return;
      }
      
      this.$el.animate({
          marginLeft: "-="+this.selectedOffset,
          marginTop: "-="+this.selectedOffset,
          boxShadow: this.selectedOffset+" "+this.selectedOffset+" 5px #888888"
      }, 200);
      
      this.isActive = true;
  },
  
  //Opposite of setActive
  setInactive: function(){
      if(!this.isActive){
          return;
      }
      
      this.$el.animate({
          marginLeft: "+="+this.selectedOffset,
          marginTop: "+="+this.selectedOffset,
          boxShadow: "none"
      }, 200);
      
      this.isActive = false;
  },
  
  
  // Sets up all the necessary callbacks for fileUpload. Prepares the dynamic file 
  // input, and determines target for the image data on the backend. Handles the 
  // upload-progress actions.
  setupFileUpload: function(){
    var my = this;
    var url = "/contacts/upload_image/"+this.model.id;
    this.$('.fileupload').fileupload({
        url: url,
        dataType: 'json',
        
        add: function (e, data) {
            
            //this happens before upload (display/reset the progress bar)
            $('#progress').fadeIn();
            $('#progress .progress-bar').css(
                'width: 0%'
            );
    
            data.submit();
        },
        
        // re-renders the view when the upload is complete (displaying the uploaded
        // image thumbnail)
        done: function (e, data) {
            
            $('#progress').fadeOut();
            console.log("Image uploaded...");
            
            //sync this model from the server (with the new image data), update the view.
            my.model.fetch({success: function(){
                my.render();        
            }});
            
        },
        
        //Animates the progress bar
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    });
  },
  
  //Sets up the jquery.jeditable plugin "edit-in-place" style form-inputs
  //which I use in the Contact Card View.
  setupJEditInPlace: function(){
      var my = this;
      
      var completeFunction = function(value, settings) {
            var put_hsh = {};
            put_hsh[this.id] = value;
            
            // These next two lines determine wether to immediately send the data
            // to the server, or to save it in the model for later sync. 
            // (Note: the disableSync parameter is only used by the "Add New Contact" form.)
            var desired_func = (my.disableSync === true)? "set" : "save";
            my.model[desired_func](put_hsh);
            
            my.render();
            return(value);
        };
      
      var jeditable_settings = {
         indicator : 'Saving...',
         tooltip   : 'Click to edit...',
         onblur    : "submit",
         event     : "mouseup.editable",
         placeholder : "<span id='jeditable_placeholder'>Click to add</span>"
      };
      
      // The following applies the "editable" behavior for all of my edit-inputs.
      this.$(".contact_attribute_edit").editable(
        completeFunction,
        jeditable_settings);

      // the "edit_area" element corresponds to textarea input 
      // (the "Extra Notes" field) 
      this.$(".contact_attribute_edit_area").editable(
        completeFunction,
        _.extend(jeditable_settings, {type: "textarea"}));
      
      
      //For the select input (really only used for the "US State" drop-down)
      this.$(".contact_attribute_edit_select").editable(
        completeFunction,
        _.extend(jeditable_settings, {
            data: _.extend(_.clone($GLOBALS.us_states), {"selected": my.model.attributes.state}),
            type: "select",
            submit: "OK"
        }));
  },
  
  //Called to destroy this model's attached image.
  destroyImage: function(){
      
      //manually set the image to null in this.model
      this.model.set({contact_image_file_name: null});
      
      //manual ajax request to destroy the image. It's rather hard to do this
      //in a more RESTful manner because of the unique way the Paperclip gem
      //assigns/destroys image attachments on the server.
      $.ajax("/contacts/destroy_image/"+this.model.id); 
      
      //re-render the view.
      this.render();
  },
  
  //Saves a model to the server.
  saveContact: function(){
      this.model.save();
      this.render();
  },
  
  //Sets up the 3rd-party jquery plugins
  setupJQueryPlugins: function(){
      this.setupFileUpload();
      this.setupJEditInPlace();
  },
  
  //Removes this view and destroys the model.
  clear: function(){
      var my = this;
      my.$el.fadeOut(400, function(){
         my.model.destroy(); 
      });
  }
  
});

//This is the view used by the "Add New Contact" form/popup. Note that it inherits
//From ContactCardView, and uses the same template, keeping the code DRY as possible.
var AddContactView = ContactCardView.extend({
    tagName: "div",
    
    events: {
        "click input.add" : "addContact"
    },
    
    //Saves the model, syncs to the server. Resets this view by creating a new,
    //empty model and re-rendering..
    addContact: function(){
        this.saveContact();
        $app.commands.execute("listAggregate", this.model);
        this.model = new ContactModel();
        $app.closeAddContactDialog();
        this.render();
    }
    
});

//This is what displays when there are no contacts to be displayed in the ContactListView
var EmptyView = Backbone.Marionette.ItemView.extend({
  template: "#empty_template",
  events: {
    "click a#add_item_link" : "popupAppAddContactDialog"
  },
  
  popupAppAddContactDialog: function(){
      $app.popupAddContactDialog();
  }
});

//This is the outermost view, responsible for rendering the whole contact list
//(and not just a single Contact view)
var ContactListView = Backbone.Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: ContactCardView,
  emptyView: EmptyView
});

//*********************************************
// APPLICATION OBJECT DEFINITION
//*********************************************

//Define the main Marionette application class.
var ContactsApp = Marionette.Application.extend({
  initialize: function(options) {
    console.log("Init marionette application...");
    var my = this;
    
    //define a member variable "contacts" to hold the contacts collection within 
    //the main application object...
    this.contacts = new ContactCollection();
  },
  
  //Fetches the initial set of data from the server to render this page...
  fetchData: function(afterSuccess){
    this.contacts.fetch({
      success: function (contacts) {
          console.log("Fetched "+contacts.length+" Contacts.");
          afterSuccess(contacts);
      }
    });
  },
  
  //This function is responsible for initializing the Views used at app runtime,
  //and then calling the actual "render" function(s) for the first time.
  renderCollection: function(){
      
    console.log("Rendering "+this.contacts.length+" Contacts...");
    var my = this;
    
    var addview = new AddContactView({
        model: new ContactModel(),
        el: ".add_new"
    });

    this.listview = new ContactListView({
        collection: this.contacts,
        el: "#contacts_list"
    });
    
    //this renders the "Add new Contact" form
    addview.render();
    addview.disableSync = true;
    addview.setupJEditInPlace();
    
    //this renders the whole contact list.
    this.listview.render();
  },
  
  //used to close the "Add new Contact" dialog window.
  closeAddContactDialog: function(){
    this.add_contact_dlg.dialog("close");
  },
  
  //used to open the "Add new Contact" dialog window.
  popupAddContactDialog: function(){
    this.add_contact_dlg = $('.add_new');
    this.add_contact_dlg.dialog({
        title: "Add New Contact",
        width: 520,
        height: 320
    });
  },
  
  //Just binds the popupAddContactDialog function to the #add_item_link click event.
  setupAddItemLink: function(){
      var my = this;
      
      //Prepares the "Add new Contact" link in the header, binds event to 
      //create a JQuery-UI Dialog.
      $('#add_item_link').bind("click", function(){
        my.popupAddContactDialog();
      });
  },
  
  // What the application does on start: fetch the data, and render the views 
  // after the data is fetched.
  onStart: function(options){
    var my = this;
    
    // Sets up the listAggregate handler, which is called from within the 
    // ContactCardView#addContact function. Basically this just aggregates the
    // new model to the CollectionView, and re-renders it.
    my.commands.setHandler("listAggregate", function(model){
        model.fetch({success: function(){
            my.contacts.add(model);
            my.listview.render();
        }});
    });
    
    my.fetchData(function(){
        my.renderCollection();
        my.setupAddItemLink();
    });
  }
  
});

//initialize our global marionette application object, ContactsApp
var $app = new ContactsApp({container: '#contacts_list'});

//Start the application!
$app.start();