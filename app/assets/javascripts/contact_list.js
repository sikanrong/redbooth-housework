/* 
 * Alex Pilafian, 2014-11-18
 * Written for RedBooth.com application process.
 */

$GLOBALS = {
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
        phone: "",
        extra_notes: ""
    },
    
    setupJQueryPlugins: function(){
        this.trigger("setup:jqueryplugins");
    }

});

//define the contact collection. 
var ContactCollection = Backbone.Collection.extend({
    url: "/contacts",
    model: ContactModel
});

var ContactCardView = Backbone.Marionette.ItemView.extend({
  tagName: "div",
  id: "single_contact_display",
  template: "#contact_template",
  
  //Related to the "active state" of this ContactCard
  selectedOffset: "5px",
  isActive: false,
  
  initialize: function(){
      var my = this;
      
      this.model.on("setup:fileupload", this.setupFileUpload, this);
      this.model.on("setup:jqueryplugins", this.setupJQueryPlugins, this);
      
      $('html').mousedown(function(event) {
        if (!$(event.target).closest(my.$el).length) {
            my.setInactive();
        };
      });
  },
  
  
  events: {
    "mousedown" : "setActive",
    
    "click a.destroy_contact" : "clear",
    "click a.toggle_edit" : "toggleEditMode",
    "click input.save" : "toggleEditMode",
    "click a.destroy_image" : "destroyImage"
  },
  
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
        
        add: function (e, data) {
            //this happens before upload (resets the progress bar)
            
            $('#progress').fadeIn();
            $('#progress .progress-bar').css(
                'width: 0%'
            );
    
            data.submit();
        },
        
        done: function (e, data) {
            
            $('#progress').fadeOut();
            console.log("Image uploaded...");
            
            //sync this model from the server, update the view
            my.model.fetch({success: function(){
                my.reRender();        
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
  
  setupJEditInPlace: function(){
      var my = this;
      
      var completeFunction = function(value, settings) {
            var put_hsh = {};
            put_hsh[this.id] = value;
            var desired_func = (my.disableSync === true)? "set" : "save";
            my.model[desired_func](put_hsh);
            my.reRender();
            return(value);
        };
      
      var jeditable_settings = {
         indicator : 'Saving...',
         tooltip   : 'Click to edit...',
         onblur    : "submit",
         event     : "mouseup.editable",
         placeholder : "<span id='jeditable_placeholder'>Click to add</span>"
     };
      
      this.$(".contact_attribute_edit").editable(
        completeFunction,
        jeditable_settings);

      this.$(".contact_attribute_edit_area").editable(
        completeFunction,
        _.extend(jeditable_settings, {type: "textarea"}));
        
      this.$(".contact_attribute_edit_select").editable(
        completeFunction,
        _.extend(jeditable_settings, {
            data: _.extend(_.clone($GLOBALS.us_states), {"selected": my.model.attributes.state}),
            type: "select",
            submit: "OK"
        }));
  },
  
  destroyImage: function(){
      this.model.set({contact_image_file_name: null});
      $.ajax("/contacts/destroy_image/"+this.model.id); 
      this.reRender();
  },
  
  saveContact: function(){
      this.model.save();
      this.reRender();
  },
  
  reRender: function(){
      this.render();
      this.setupJQueryPlugins();
  },
  
  setupJQueryPlugins: function(){
      this.setupFileUpload();
      this.setupJEditInPlace();
  },
  
  clear: function(){
      var my = this;
      my.$el.fadeOut(400, function(){
         my.model.destroy(); 
      });
  }
  
});

var AddContactView = ContactCardView.extend({
    tagName: "div",
    template: "#contact_template",
    
    events: {
        "click input.add" : "addContact"
    },
    
    addContact: function(){
        this.saveContact();
        $app.commands.execute("listAggregate", this.model);
        this.model = new ContactModel();
        $app.closeAddContactDialog();
        this.render();
    }
    
});

var EmptyView = Backbone.Marionette.ItemView.extend({
  template: "#empty_template",
  events: {
    "click a#add_item_link" : "popupAppAddContactDialog"
  },
  
  popupAppAddContactDialog: function(){
      $app.popupAddContactDialog();
  }
});

var ContactListView = Backbone.Marionette.CollectionView.extend({
  tagName: 'ul',
  childView: ContactCardView,
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
  
  setupJQueryPlugins: function(){
    this.contacts.each(function(contact_model){
        contact_model.setupJQueryPlugins();
    });
  },
  
  reRenderCollection: function(){
    this.listview.render();
    this.setupJQueryPlugins();  
  },
  
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
    
    this.list_region = new Backbone.Marionette.Region({
        el: "#list_region"
    });
    
    this.list_region.on("show", function(view){
        my.setupJQueryPlugins();
    });
    
    addview.render();
    addview.disableSync = true;
    addview.setupJEditInPlace();
    
    this.list_region.show(this.listview);
  },
  
  closeAddContactDialog: function(){
    this.add_contact_dlg.dialog("close");
  },
  
  popupAddContactDialog: function(){
    this.add_contact_dlg = $('.add_new');
    this.add_contact_dlg.dialog({
        title: "Add New Contact",
        width: 520,
        height: 320
    });
  },
  
  setupAddItemLink: function(){
      var my = this;
      
      //Prepares the "Add new Contact" link in the header, binds event to 
      //create a JQuery-UI Dialog.
      $('#add_item_link').bind("click", function(){
        my.popupAddContactDialog();
      });
  },
  
  onStart: function(options){
    var my = this;
    
    my.fetchData(function(){
        my.renderCollection();
        my.setupAddItemLink();
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